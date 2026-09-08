import React, { useEffect } from 'react';
import cx from 'classnames';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { closeSidebar, toggleSidebar } from '../../features/ui/uiSlice';
import Footer from '../Footer';
import Header from '../Header';
import Sidebar from '../Sidebar';
import s from './Layout.module.scss';

const Layout = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigation = useNavigation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  useEffect(() => {
    dispatch(closeSidebar());
  }, [dispatch, location.pathname]);

  return (
    <div className={s.root}>
      <a className={s.skipLink} href="#main-content">
        Skip to main content
      </a>
      <div className={cx({ 'sidebar-open': sidebarOpen })}>
        <Sidebar />
      </div>
      <div className={cx(s.wrap, { [s.sidebarOpen]: sidebarOpen })}>
        <Header sidebarOpen={sidebarOpen} sidebarToggle={() => dispatch(toggleSidebar())} />
        <main className={s.content} id="main-content" tabIndex={-1}>
          {navigation.state !== 'idle' ? (
            <div aria-live="polite" className="alert alert-light border mb-lg" role="status">
              Updating route content...
            </div>
          ) : null}
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
