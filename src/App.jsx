// import React, { Suspense, lazy } from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./styles/common.scss";
// import ScrollToTop from "./Component/ScrollToTop/ScrollToTop";
// const Login = lazy(() => import("./screens/Login/Login"));
// const Layout = lazy(() => import("./Component/Layout/Layout"));
// const Dashboard = lazy(() => import("./screens/Dashboard/Dashboard"));
// const Overview = lazy(() => import("./screens/Overview/Overview"));
// const Product = lazy(() => import("./screens/Otherpages/Product"));
// const SubCategories = lazy(() => import("./screens/Otherpages/SubCategories"));
// const Category = lazy(() => import("./screens/Otherpages/Category"));
// const Customer = lazy(() => import("./screens/Otherpages/Customer"));
// const Banners = lazy(() => import("./screens/Otherpages/Banners"));
// const Testimonials = lazy(() => import("./screens/Otherpages/Testomonials"));
// const Orders = lazy(() => import("./screens/Otherpages/Orders"));
// const ProductDetails = lazy(() =>
//   import("./screens/Otherpages/ProductDetails")
// );
// const ProductRate = lazy(() => import("./screens/Otherpages/ProductRate"));
// const Ratehistory = lazy(() => import("./screens/Otherpages/Ratehistory"));
// const BannerImage = lazy(() => import("./screens/Otherpages/BannerImage"));
// const OrderDetails = lazy(() => import("./screens/Otherpages/Orderdetails"));
// const AddproductImage = lazy(() =>
//   import("./screens/Otherpages/Addimageproduct")
// );

// function App() {
//   return (
//     <Router>
//       <ScrollToTop />

//       <Suspense fallback={<div>Loading...</div>}>
//         <Routes>
//           <Route path="/" element={<Login />} />

//           <Route path="/" element={<Layout />}>
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="overview" element={<Overview />} />

//             <Route path="product" element={<Product />} />
//             <Route path="subcategories" element={<SubCategories />} />
//             <Route path="category" element={<Category />} />
//             <Route path="customer" element={<Customer />} />
//             <Route path="banners" element={<Banners />} />
//             <Route path="testimonials" element={<Testimonials />} />
//             <Route path="orders" element={<Orders />} />
//             <Route path="productDetails/:id" element={<ProductDetails />} />
//             <Route path="productRate" element={<ProductRate />} />
//             <Route path="ratehistory" element={<Ratehistory />} />
//             <Route path="orderDetails/:orderId" element={<OrderDetails />}></Route>
//             <Route path="bannerImage/:bannerId" element={<BannerImage />} />
//             <Route
//               path="addproductImage/:productId"
//               element={<AddproductImage />}
//             />
//           </Route>
//         </Routes>
//         <ToastContainer />
//       </Suspense>
//     </Router>
//   );
// }

// export default App;

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/common.scss";
import ScrollToTop from "./Component/ScrollToTop/ScrollToTop";
import ProtectedRoute from "./protectedRoute/protectedRoute";
import Invoice from "./screens/Otherpages/Invoice";
import CouponCode from "./screens/Otherpages/CouponCode";
import PromotionalMails from "./screens/Otherpages/PromotionalMails";
import CustomerDetails from "./screens/Otherpages/CustomerDetails";
const Dashboard = lazy(() => import("./screens/Dashboard/Dashboard"));
const Overview = lazy(() => import("./screens/Overview/Overview"));
const Product = lazy(() => import("./screens/Otherpages/Product"));
const SharedProducts = lazy(() =>
  import("./screens/Otherpages/SharedProducts")
);
const ShardLinkProductdetails = lazy(() =>
  import("./screens/Otherpages/ShardLinkProductdetails")
);
const SubCategories = lazy(() => import("./screens/Otherpages/SubCategories"));
const Category = lazy(() => import("./screens/Otherpages/Category"));
const Imagmedia = lazy(() => import("./screens/Otherpages/ImageMedia"));
const Customer = lazy(() => import("./screens/Otherpages/Customer"));
const Banners = lazy(() => import("./screens/Otherpages/Banners"));
const Testimonials = lazy(() => import("./screens/Otherpages/Testomonials"));
const Orders = lazy(() => import("./screens/Otherpages/Orders"));
const ProductDetails = lazy(() =>
  import("./screens/Otherpages/ProductDetails")
);
const ProductRate = lazy(() => import("./screens/Otherpages/ProductRate"));
const Ratehistory = lazy(() => import("./screens/Otherpages/Ratehistory"));
const BannerImage = lazy(() => import("./screens/Otherpages/BannerImage"));
const OrderDetails = lazy(() => import("./screens/Otherpages/Orderdetails"));
const BulkProductImport = lazy(() =>
  import("./screens/Otherpages/BulkProductImport")
);
const ContactUs = lazy(() => import("./screens/Otherpages/ContactUs"));
const AddproductImage = lazy(() =>
  import("./screens/Otherpages/Addimageproduct")
);
const TicketDetails = lazy(() => import("./screens/Otherpages/TicketDetails"));
const AllBanner = lazy(() => import("./screens/Otherpages/AllBanner"));
const PurchaseOrder = lazy(() =>
  import("./screens/Otherpages/PurchaseOrederi")
);
const PurchaseOrderItem = lazy(() =>
  import("./screens/Otherpages/PurchaseOrderItem")
);
const OrderLog = lazy(() => import("./screens/Otherpages/OrderLog"));
const Exception = lazy(() => import("./screens/Otherpages/Exception"));
const ExceptionMessage = lazy(() =>
  import("./screens/Otherpages/Exceptionformilind")
);
const ReplaceOrder = lazy(() => import("./screens/Otherpages/ReplaceOrder"));
const PoinvoiceDetails = lazy(() =>
  import("./screens/Otherpages/PoinvoiceDetails")
);
// Your lazy imports remain the same
const Login = lazy(() => import("./screens/Login/Login"));
const Layout = lazy(() => import("./Component/Layout/Layout"));
// ... other lazy imports

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/shared-products/:slug" element={<SharedProducts />} />
          <Route
            path="/sharedProductslink/:slug"
            element={<ShardLinkProductdetails />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="product" element={<Product />} />

            <Route path="customer" element={<Customer />} />
            <Route path="productDetails/:id" element={<ProductDetails />} />
            <Route path="orders" element={<Orders />} />
            <Route path="category" element={<Category />} />
            <Route path="imagemedia" element={<Imagmedia />} />
            <Route path="orderDetails/:orderId" element={<OrderDetails />} />
            <Route path="dealers/:id" element={<CustomerDetails />} />
            <Route path="tickets" element={<ContactUs />} />
            <Route path="/ticket/:id" element={<TicketDetails />} />
            <Route path="banners" element={<Banners />} />
            <Route path="All-Banners" element={<AllBanner />} />
            <Route path="purchaseOrder" element={<PurchaseOrder />} />
            <Route
              path="purchaseOrderItem/:id"
              element={<PurchaseOrderItem />}
            />
            <Route path="bulkProductImport" element={<BulkProductImport />} />
            <Route path="purchaseOrderItemLogs/:id" element={<OrderLog />} />
            <Route path="exception" element={<Exception />} />
            <Route path="ExceptionM" element={<ExceptionMessage />} />
            <Route path="replaceOrder/:orderId" element={<ReplaceOrder />} />
            <Route path="poInvoice/:id" element={<PoinvoiceDetails />} />

            {/*  <Route path="overview" element={<Overview />} />
             <Route path="subcategories" element={<SubCategories />} />
             <Route path="testimonials" element={<Testimonials />} />
            <Route path="productRate" element={<ProductRate />} />
            <Route path="ratehistory" element={<Ratehistory />} />
            <Route path="bannerImage/:bannerId" element={<BannerImage />} />
            <Route path="addproductImage/:productId" element={<AddproductImage />} />
            <Route path="coupons" element={<CouponCode />} />
            <Route path="subscribers" element= {<PromotionalMails/>} /> */}
          </Route>
          {/* <Route path="/invoice/:orderId" element={<Invoice/>} /> */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
