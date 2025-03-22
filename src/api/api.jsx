import axios from "axios";

// Base URL for the API
export const BASE_URL = "http://localhost:8000/api";

export const IMG_URL = "http://localhost:8000";

// export const BASE_URL = "ceat-miles.bespokesol.com/api";
// export const BASE_URL = "http://ceat-miles-api.bespokesol.com/api";

// export const IMG_URL = "http://ceat-miles-api.bespokesol.com";

// const WEBSITE_URL = "https://api.trekpanda.in/api";

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Utility Functions
export const getToken = () => localStorage.getItem("authToken");

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logoutAPI = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
};

// Generalized API Request Function
const apiRequest = async (endpoint, data = null, method = "post") => {
  console.log(endpoint, "endpointendpoint");
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("Base URL:", api.defaults.baseURL);
  const response = await api.request({
    url: endpoint,
    method,
    data,
    headers,
  });
  return response.data;
};

// Authentication APIs
export const loginAPI = async (payload) => {
  const data = await apiRequest("/users/login", payload);
  if (data?.token) {
    localStorage.setItem("user", JSON.stringify(data.userDetails));
    localStorage.setItem("token", data.token);
  }
  return data;
};

export const registerUserAPI = (userData) =>
  apiRequest("/users/register", userData);

// Add banner
export const addAnnouncementAPI = (userData) =>
  apiRequest("/announcement/create", userData, "post");

export const getAllAnnouncementAPI = (payload) =>
  apiRequest("/announcement/all", payload, "get");

export const updateAnnouncementAPI = (id, formDataToSend) =>
  apiRequest(`/announcement/update/${id}`, formDataToSend, "post");

export const toggleAnnouncementStatusApi = ({ id, status }) =>
  apiRequest(`/announcement/status/${id}`, status, "post");

export const updateProductImageAPI = (data) =>
  apiRequest(`/productimage/updateProductImage`, data, "post");

export const getByBannerIdAPI = (bannerId) =>
  apiRequest(`/productimage/getByBannerId/${bannerId}`, null, "get");

export const deleteBannerAPI = (id) =>
  apiRequest(`/banner/deleteBanner/${id}`, "post");

export const deleteProductImageAPI = (id) =>
  apiRequest(`/productimage/deleteProductImage/${id}`, null, "delete");

export const uploadImageAPI = (userData) =>
  apiRequest("/productimage/addProductImages", userData, "post");

// All Rate API
export const addRateAPI = (userData) =>
  apiRequest("/productrate/addRate", userData, "post");

export const getAllratehistoryAPI = (payload) =>
  apiRequest("/productrate/getAllRates", payload, "get");

export const getlatestAllRatesAPI = (payload) =>
  apiRequest("/productrate/getAlllatest", payload, "get");

export const updateRatesAPI = ({ id, ...data }) =>
  apiRequest(`/productrate/updateRate/${id}`, data, "post");

//  ALL Product API
export const addProductAPI = (userData) =>
  apiRequest(`/products/createProduct`, userData, "post");

export const updateProductAPI = ({ id, formData }) =>
  apiRequest(`/products/updateProduct/${id}`, formData, "post");

export const deleteProductAPI = (id) =>
  apiRequest(`/products/deleteProduct/${id}`, null, "post");

export const getAllproductsAPI = ({ payload, page = 1, limit = 10 }) =>
  apiRequest(
    `/products/getAllProducts?page=${page}?limit=${limit}`,
    payload,
    "get"
  );

export const getAllVendorsAPI = (payload) =>
  apiRequest("/users/getAllVendors", payload, "get");

export const getProductMinStock = (payload) =>
  apiRequest("/product/getMinStock", payload, "get");

export const addsharedcollectionAPI = (userData) =>
  apiRequest(
    `/sharedcollection/createSharedProductCollection`,
    userData,
    "post"
  );

export const addMediaAPI = (userData) =>
  apiRequest(`/media/addMedia`, userData, "post");

export const updateMediaAPI = ({ id, formData }) =>
  apiRequest(`/category/updateCategory/${id}`, formData, "post");

export const deleteMediaAPI = (id) =>
  apiRequest(`/media/deleteMedia/${id}`, null, "post");

export const getAllMediaAPI = (payload) =>
  apiRequest("/media/getAllMedia", payload, "get");
// Update the API function to send ID in the request body
export const getsharedcollectionproductAPI = (data) =>
  apiRequest("/sharedcollection/getSharedProducts", data, "post");

// update rate api
export const updateProductRateAPI = ({ id, ...data }) =>
  apiRequest(`/product/updateRate/${id}`, data, "post");

export const getByproductIdAPI = (productId) =>
  apiRequest(`/productimage/getByProductId/${productId}`, null, "get");

export const getProductByIdAPI = (id) =>
  apiRequest(`/products/getProductById/${id}`, null, "get");

// all category API
export const addCategoryAPI = (userData) =>
  apiRequest(`/category/createCategory`, userData, "post");

export const updateCategoryAPI = ({ id, formData }) =>
  apiRequest(`/category/updateCategory/${id}`, formData, "post");

export const deleteCategoryAPI = (id) =>
  apiRequest(`/category/deleteCategory/${id}`, null, "post");

export const getAllcategoriesAPI = (payload) =>
  apiRequest("/category/getAllCategories", payload, "get");

// po order apis

export const addpurchaseorderAPI = (userData) =>
  apiRequest(`/purchaseOrder/createPurchaseOrder`, userData, "post");

export const getAllpurchaseAPI = (payload) =>
  apiRequest("/purchaseOrder/getAllPurchaseOrders", payload, "get");

export const updatePurchaseOrderAPI = ({ id, formData }) =>
  apiRequest(`/purchaseOrder/updatePurchaseOrder/${id}`, formData, "post");

export const deletePurchaseorderAPI = (id) =>
  apiRequest(`/purchaseOrder/deletePurchaseOrder/${id}`, null, "post");

export const getPoItemsByPoIdAPI = (po_id) =>
  apiRequest(`/poItems/getPoItemById/${po_id}`, null, "get");

export const deletePurchaseordritemAPI = (po_id) =>
  apiRequest(`/poItems/deletePoItem/${po_id}`, null, "post");

export const getprocuredQunatitytAPI = (po_id) =>
  apiRequest(`/poItemsLog/procuredQuantity/${po_id}`, null, "get");

export const addpurchaseoreditemAPI = (userData) =>
  apiRequest(`/poItems/createPoItem`, userData, "post");

// purchase order Log
export const addpurchaseorderLogAPI = (userData) =>
  apiRequest(`/poItemsLog/createPoItemLog`, userData, "post");

export const getpurchaseorderLogAPI = (po_items_id) =>
  apiRequest(`/poItemsLog/getPoItemLogById/${po_items_id}`, null, "get");

//Exception

export const addExceptionAPI = (userData) =>
  apiRequest(`/exception/createException`, userData, "post");

export const getAllexceptionAPI = (payload) =>
  apiRequest("/exception/getAllExceptions", payload, "get");

export const deleteexceptionAPI = (id) =>
  apiRequest(`/exception/deleteException/${id}`, null, "post");

export const replaceplaceOrderAPI = (payload) =>
  apiRequest(`/orders/placeReplacementOrder`, payload, "post");

export const updateexceptionstatusAPI = (data) =>
  apiRequest("/exception/updateExceptionStatus", data, "post");

// po Invoice

export const addPoInvoiceAPI = (userData) =>
  apiRequest(`/poinvoice/addPoInvoice`, userData, "post");

export const getpoiteminvoiceAPI = (po_id) =>
  apiRequest(`/poinvoice/getInvoicesByPoItem`, po_id, "post");

export const deleteinvoiceAPI = (id) =>
  apiRequest(`/poinvoice/deletePoInvoice/${id}`, null, "post");

//  all banner API

export const addBannerAPI = (userData) =>
  apiRequest(`/banners/addBanner`, userData, "post");

export const updateBannerAPI = ({ id, formData }) =>
  apiRequest(`/banners/updateBanner/${id}`, formData, "post");

export const deleteBannersAPI = (id) =>
  apiRequest(`/banners/deleteBanner/${id}`, null, "post");

export const getAllBannersAPI = (payload) =>
  apiRequest("/banners/getAllBanners", payload, "get");

export const activateBanner = (id) =>
  apiRequest(`/banners/activateBanner/${id}`, null, "post");

// Subcategory API
export const getAllSubcategoriesAPI = (payload) =>
  apiRequest("/subcategory/getAllSubcategories", payload, "get");

export const getAllSubcategoryByCategoryIdAPI = (id) =>
  apiRequest(`/subcategory/getAllSubcategoryByCategoryId/${id}`, null, "get");

export const addSubcategopryAPI = (userData) =>
  apiRequest("/subcategory/addSubcategory", userData, "post");

export const updateSubcategoryAPI = (id, data) =>
  apiRequest(`/subcategory/updateSubcategory/${id}`, data, "post");

// add dealers API

export const addDealerAPI = (userData) =>
  apiRequest(`/dealer/addDealer`, userData, "post");

export const updateDealerAPI = (id, data) =>
  apiRequest(`/dealer/updateDealer/${id}`, data, "post");

export const deleteDealerAPI = (id) =>
  apiRequest(`/dealer/deleteDealer/${id}`, null, "post");

export const getDealersAPI = (id) =>
  apiRequest(`/dealer/getDealer/${id}`, null, "get");

export const editMobile = (id, payload) =>
  apiRequest(`/dealer/editMobileNumber/${id}`, payload, "post");

export const addPoints = (id, payload) =>
  apiRequest(`/dealer/addPoints/${id}`, payload, "post");

export const removePoints = (id, payload) =>
  apiRequest(`/dealer/removePoints/${id}`, payload, "post");

export const importDealersAPI = (formData) =>
  apiRequest(`/dealer/import`, formData, "post");

export const exportPointsReportAPI = (payload) =>
  apiRequest(`/dealer/export-dealers`, payload, "get");

export const getAllDealersAPI = (page = 1, limit = 10, searchTerm) => {
  return axios.get(
    `${BASE_URL}/dealer/getAllDealers?page=${page}&limit=${limit}?search=${searchTerm}`
  );
};

// Admin User API
export const getAllAdminUsersAPI = (page = 1, limit = 10) => {
  return axios.get(
    `${BASE_URL}/dealer/getAllAdminUsers?page=${page}&limit=${limit}`
  );
};

export const getAllOrderAPI = (payload) =>
  apiRequest("/orders/orders", payload, "get");

export const updateOrderstatusAPI = ({ orderId, ...data }) =>
  apiRequest(`/order/updateOrderStatus/${orderId}`, data, "post");

export const toggleProductCheckedAPI = ({ id, userData }) =>
  apiRequest(`/product/toggleProductChecked/${id}`, userData, "post");

export const getAllOrderitemsAPI = (payload) =>
  apiRequest("/order/getAllOrderwithoutfilter", payload, "get");

export const getorderItemsByorderIdAPI = (orderId) =>
  apiRequest(`/orderitems/getOrderbyid/${orderId}`, null, "get");

export const getOrderdetailsByOrderIdAPI = (orderId) =>
  apiRequest(`/orders/getOrderById/${orderId}`, null, "get");

export const exportOrdersToCSV = (payload) =>
  apiRequest(`/orders/export`, payload, "get");

export const exportOrderToCSVByDate = (startDate, endDate) =>
  apiRequest(
    `/orders/export-by-date?startDate=${startDate}&endDate=${endDate}`,
    null,
    "get"
  );

export const exportOrderItemsToCSV = (payload) =>
  apiRequest(`/orders/export-orders-items`, payload, "get");

export const exportOrderItemsToCSVByDate = (startDate, endDate) =>
  apiRequest(
    `/orders/export-orders-items-by-date?startDate=${startDate}&endDate=${endDate}`,
    null,
    "get"
  );

// Ticket API

export const createTicketAPI = (formData) =>
  apiRequest("/ticket/createTicket", formData, "post");

export const getTicketDetailsAPI = async (ticketId) => {
  return apiRequest(`/ticket/ticket/${ticketId}`, null, "GET");
};

export const getAddressesByDealerIdAPI = (dealerId) =>
  apiRequest(`/address/getAddressesByDealerId/${dealerId}`, null, "get");
export const getTicketById = (id) =>
  apiRequest(`/ticket/getTicketById/${id}`, null, "get");

export const updateTicketAPI = ({ id, status }) =>
  apiRequest(`/ticket/updateStatus/${id}`, status, "post");

export const getAllTicketAPI = (page = 1, limit = 10) =>
  apiRequest(`/ticket/getTicket?page=${page}&limit=${limit}`, null, "get");

// Coupon Code API

export const addCouponCodeAPI = (Coupondata) =>
  apiRequest(`/coupon/createCouponCode`, Coupondata, "post");

export const getAllCouponCodeAPI = () =>
  apiRequest(`/coupon/getCouponCodes`, null, "get");

export const updateCouponCodeAPI = ({ id, ...data }) =>
  apiRequest(`/coupon/updateCouponCode/${id}`, data, "post");

// Send Promotional Email API

// export const sendPromotionalEmailAPI = (data) =>
//   apiRequest(`/subscribe/send-newsletter`, data, "post");

// get all subscribes
export const getAllSubscribeAPI = () =>
  apiRequest(`/subscribe/get-all-subscribers`, null, "get");

// testinomials API

export const addTestinomialsAPI = (testinomialsData) =>
  apiRequest(`/testimonials/addtestimonials`, testinomialsData, "post");

export const getAllTestinomialsAPI = () =>
  apiRequest(`/testimonials/getalltestimonials`, null, "get");

export const updateTestinomialsAPI = ({ id, formData }) =>
  apiRequest(`/testimonials/updatetestimonials/${id}`, formData, "post");

export const deleteTestinomialsAPI = (id) =>
  apiRequest(`/testimonials/deletetestimonials/${id}`, null, "post");

// Remarks API

export const addRemarksAPI = (dealer_id, remarksData) =>
  apiRequest(`/remarks/createRemark/${dealer_id}`, remarksData, "post");

export const getAllRemarksAPI = () =>
  apiRequest(`/remarks/getAllRemarks`, null, "get");

export const updateRemarksAPI = ({ id, formData }) =>
  apiRequest(`/remarks/update/${id}`, formData, "post");

export const deleteRemarksAPI = (id) =>
  apiRequest(`/remarks/deleteremarks/${id}`, null, "post");

export const getRemarksByDealerIdAPI = (orderId) =>
  apiRequest(`/remarks/getRemarksByDealerId/${orderId}`, null, "get");
