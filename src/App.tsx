import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AboutPage from './pages/AboutPage';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerHome from './pages/owner/OwnerHome';
import OwnerProducts from './pages/owner/OwnerProducts';
import OwnerProductForm from './pages/owner/OwnerProductForm';
import OwnerBulkUpload from './pages/owner/OwnerBulkUpload';
import OwnerOrders from './pages/owner/OwnerOrders';
import OwnerPayments from './pages/owner/OwnerPayments';
import OwnerSettings from './pages/owner/OwnerSettings';

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="p/:id" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
            <Route path="owner/login" element={<OwnerLogin />} />
            <Route path="owner" element={<OwnerLayout />}>
              <Route index element={<OwnerHome />} />
              <Route path="products" element={<OwnerProducts />} />
              <Route path="products/new" element={<OwnerProductForm />} />
              <Route path="products/bulk" element={<OwnerBulkUpload />} />
              <Route path="products/:id" element={<OwnerProductForm />} />
              <Route path="orders" element={<OwnerOrders />} />
              <Route path="payments" element={<OwnerPayments />} />
              <Route path="settings" element={<OwnerSettings />} />
            </Route>
          </Routes>
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
