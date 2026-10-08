import {createContext, useContext, useState, useEffect} from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('wm_imports_token');
    const storedUser = localStorage.getItem('wm_imports_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao restaurar a sessão:', error);
        localStorage.removeItem('wm_imports_token');
        localStorage.removeItem('wm_imports_user');
      }
    }
    setLoading(false);
  }, []);


  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('wm_imports_token', jwtToken);
    localStorage.setItem('wm_imports_user', JSON.stringify(userData));
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wm_imports_token');
    localStorage.removeItem('wm_imports_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}