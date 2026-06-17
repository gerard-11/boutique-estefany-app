import api from './api';
import { z } from 'zod';

// --- Esquema de Validación ---
export const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  price: z.coerce.number().positive("El precio de venta es obligatorio y debe ser positivo"),
  cost: z.coerce.number().positive("El precio de compra es obligatorio y debe ser positivo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  size: z.string().optional().nullable(),
  sizeUnit: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  departmentName: z.string().optional(),
  categoryName: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
}).refine(data => {
  const hasDept = data.departmentId || data.departmentName;
  const hasCat = data.categoryId || data.categoryName;
  return hasDept && hasCat;
}, {
  message: "Debes seleccionar o crear un departamento y categoría",
  path: ["categoryId"]
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const getProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${barcode}`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/departments', { skipAuth: true });
  return response.data;
};

export const getCategories = async (departmentId) => {
  const response = await api.get('/categories', {
    params: { departmentId }
  });
  return response.data;
};

