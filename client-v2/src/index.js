import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import Routes from './routes';
import './styles/reset.css';
import './styles/global.scss';
import AuthCheck from './components/AuthCheck';
import { ProductsProvider } from './configs/ProductsData';

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ProductsProvider>
            <Provider store={store}>
                <AuthCheck />
                <Routes />
            </Provider>
        </ProductsProvider>
    </React.StrictMode>
);
