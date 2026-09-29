import api from "@/lib/api";

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const register = async (user) => {
  const { data } = await api.post("/auth/register", user);

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const currentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};