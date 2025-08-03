import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className='height-100vh'>
             <div className="min-h-screen">
                <Outlet></Outlet>
            </div>       
        </div>
    );
};

export default MainLayout;