import React, { createContext, useContext, useState, useEffect } from "react";

interface UsuarioLogado {
  id: number;
  nome: string;
  tipo: string;
  token: string;
}

interface AuthContextType {
  usuario: UsuarioLogado | null;
  login: (usuario: UsuarioLogado) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  const login = (usuario: UsuarioLogado) => {
    setUsuario(usuario);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("token", usuario.token);
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 