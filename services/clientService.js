import api from "@/lib/api";

export const getClients = async (
  page = 1,
  search = ""
) => {
  try {
    const response = await api.get("/clients", {
      params: {
        page,
        search,
      },
    });

    return response.data?.data || [];
  } catch (error) {
    console.log(
      "GET CLIENTS FAILED:",
      error.message
    );

    return [];
  }
};

export const getClient = async (id) => {
  const response = await api.get(
    `/clients/${id}`
  );

  return response.data?.data;
};

export const createClient = async (client) => {
  const response = await api.post(
    "/clients",
    client
  );

  return response.data?.data;
};

export const updateClient = async (
  id,
  client
) => {
  const response = await api.put(
    `/clients/${id}`,
    client
  );

  return response.data?.data;
};

export const deleteClient = async (id) => {
  const response = await api.delete(
    `/clients/${id}`
  );

  return response.data;
};