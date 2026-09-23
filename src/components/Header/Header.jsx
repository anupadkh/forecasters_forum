import React from 'react';
import cx from 'classnames';
import { List } from 'react-bootstrap-icons';

import s from './Header.module.scss';

const Header = ({ sidebarOpen, sidebarToggle }) => {
  return (
    <header className={cx('navbar', s.root)}>
      <div className="d-flex align-items-center gap-3">
        <button
          aria-controls="dashboard-sidebar"
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className={cx('btn btn-link text-muted p-0', s.headerIcon, s.sidebarToggler)}
          onClick={sidebarToggle}
          type="button"
        >
          <List aria-hidden="true" size={28} />
        </button>
      </div>
    </header>
  );
};

export default Header;

