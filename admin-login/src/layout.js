// src/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/Header';

const Layout = () => {
    return (
        <div>
            <Header /> {/* The Header will stay mounted */}
            <Outlet /> {/* Renders the child routes */}
        </div>
    );
};

export default Layout;
