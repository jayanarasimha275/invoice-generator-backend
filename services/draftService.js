import api from "@/lib/api";

export const getDrafts = async () => {
  const res = await api.get("/drafts");
  return res.data;
};

export const saveDraft = async (draft) => {
  const res = await api.post("/drafts", draft);
  return res.data;
};

export const deleteDraft = async (id) => {
  const res = await api.delete(`/drafts/${id}`);
  return res.data;
};