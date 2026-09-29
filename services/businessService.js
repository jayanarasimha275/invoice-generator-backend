import api from "@/lib/api";

export const getBusinesses = async () => {
  const { data } = await api.get("/businesses");

  return data;
};

export const getBusiness = async (id) => {
  const { data } = await api.get(
    `/businesses/${id}`
  );

  return data;
};

export const createBusiness = async (business) => {
  const { data } = await api.post(
    "/businesses",
    business
  );

  return data;
};

export const updateBusiness = async (
  id,
  business
) => {
  const { data } = await api.put(
    `/businesses/${id}`,
    business
  );

  return data;
};

export const deleteBusiness = async (id) => {
  const { data } = await api.delete(
    `/businesses/${id}`
  );

  return data;
};