import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../app/supabase';
import { useAuthStore } from '../store/authStore';
import DeviceInfo from 'react-native-device-info';
import * as Keychain from 'react-native-keychain';

export function useAuth() {
  const { setAuth, setLoading, logout: storeLogout, setDeviceApproved } = useAuthStore();

  const checkUser = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (employee) {
        setAuth(employee);
        const deviceId = await DeviceInfo.getUniqueId();
        if (employee.device_id && employee.device_id !== deviceId) {
          setDeviceApproved(false);
        } else {
          setDeviceApproved(true);
        }
      }
    }
    setLoading(false);
  }, [setAuth, setLoading, setDeviceApproved]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const loginWithEmail = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    await checkUser();
    return data;
  };

  const loginWithPhone = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return data;
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    await checkUser();
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    storeLogout();
  };

  return { loginWithEmail, loginWithPhone, verifyOTP, logout, checkUser };
}
