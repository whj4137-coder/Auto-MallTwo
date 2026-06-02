import { Routes, Route } from "react-router-dom";
import { FrontLayout } from "./components/FrontLayout";
import { Home } from "./pages/Home";
import { Category } from "./pages/Category";
import { ProductDetail } from "./pages/ProductDetail";
import { Membership } from "./pages/Membership";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Cart } from "./pages/Cart";
import { Confirm } from "./pages/Confirm";
import { Pay } from "./pages/Pay";
import { Result } from "./pages/Result";
import { Orders } from "./pages/Orders";
import { OrderDetail } from "./pages/OrderDetail";
import { Mine } from "./pages/Mine";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminProducts } from "./admin/AdminProducts";
import { AdminOrders } from "./admin/AdminOrders";
import { AdminBanners } from "./admin/AdminBanners";
import { AdminServices } from "./admin/AdminServices";
import { AdminSession } from "./admin/AdminSession";
import { AdminAccount } from "./admin/AdminAccount";

export default function App() {
  return (
    <Routes>
      <Route element={<FrontLayout />}>
        <Route index element={<Home />} />
        <Route path="category" element={<Category />} />
        <Route path="product/:code" element={<ProductDetail />} />
        <Route path="membership/:code" element={<Membership />} />
        <Route path="service/:code" element={<ServiceDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="confirm/:id" element={<Confirm />} />
        <Route path="pay/:id" element={<Pay />} />
        <Route path="result" element={<Result />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderNo" element={<OrderDetail />} />
        <Route path="mine" element={<Mine />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="session" element={<AdminSession />} />
        <Route path="account" element={<AdminAccount />} />
      </Route>
    </Routes>
  );
}
