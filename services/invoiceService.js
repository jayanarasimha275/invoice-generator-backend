import api from "@/lib/api";

export const getInvoices = async () => {
  const res = await api.get("/invoices");
  return res.data;
};

export const getInvoice = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
};

export const createInvoice = async (invoice) => {
  const res = await api.post("/invoices", invoice);
  return res.data.data;
};
export const updateInvoice = async (id, invoice) => {
  const res = await api.put(`/invoices/${id}`, invoice);
  return res.data;
};

export const deleteInvoice = async (id) => {
  const res = await api.delete(`/invoices/${id}`);
  return res.data;
};