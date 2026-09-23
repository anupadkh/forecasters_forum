import React, { useMemo } from 'react';
import cx from 'classnames';
import { BoxArrowInRight, BoxArrowRight, PersonCircle } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import Icon from '../Icon';
import LinksGroup from './LinksGroup/LinksGroup';
import s from './Sidebar.module.scss';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const session = useAppSelector((state) => state.auth.session);
  const adminName = useMemo(() => session?.user.name ?? 'Administrator', [session]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav aria-label="Primary navigation" className={s.root} id="dashboard-sidebar">
      <header className={s.logo}>
        <Link aria-label="Dashboard home" to="/app/main">
          <Icon decorative glyph="logo" />
        </Link>
      </header>
      <ul className={s.nav}>
        {/* <LinksGroup glyph="dashboard" header="Dashboard" headerLink="/app/main" />
        <LinksGroup glyph="typography" header="Typography" headerLink="/app/typography" />
        <LinksGroup glyph="tables" header="Tables Basic" headerLink="/app/tables" />
        <LinksGroup glyph="notifications" header="Notifications" headerLink="/app/notifications" />
        <LinksGroup
          glyph="components"
          header="Components"
          headerLink="/app/components"
          childrenLinks={[
            { name: 'Buttons', link: '/app/components/buttons' },
            { name: 'Charts', link: '/app/components/charts' },
            { name: 'Icons', link: '/app/components/icons' },
            { name: 'Maps', link: '/app/components/maps' },
          ]}
        /> */}
        <LinksGroup
          glyph="bulletin"
          header="Bulletin"
          headerLink="/app/bulletin"
          childrenLinks={[
            { name: 'Create Bulletin', link: '/app/bulletin' },
            { name: 'List Bulletins', link: '/app/bulletin/list' },
            { name: 'Design Template', link: '/app/bulletin/designer' },
            { name: 'Report View', link: '/app/bulletin/report' },
          ]}
        />
      </ul>
      <div className={s.footer}>
        {session ? (
          <>
            <Link className={s.userInfo} title="View Profile" to="/app/profile">
              <PersonCircle aria-hidden="true" size={24} />
              <div className={s.userMeta}>
                <span className={s.userName}>{adminName}</span>
                <span className={s.userRole}>Profile</span>
              </div>
            </Link>
            <button
              aria-label="Logout"
              className={cx(s.authBtn, s.logoutBtn)}
              onClick={handleLogout}
              type="button"
            >
              <BoxArrowRight aria-hidden="true" size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link aria-label="Login" className={cx(s.authBtn, s.loginBtn)} to="/login">
            <BoxArrowInRight aria-hidden="true" size={16} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;

