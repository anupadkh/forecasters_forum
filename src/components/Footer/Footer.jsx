import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link } from 'react-router-dom';

import s from './Footer.module.scss';

const Footer = ({ className }) => (
  <footer className={cx(s.root, className)}>
    <div className={s.container}>
      <span>
        &copy; {new Date().getFullYear()} <a href="https://www.sahf.info" rel="noreferrer" target="_blank">SAHF</a>
      </span>
      {/* <span className={s.spacer}>·</span>
      <Link to="/app/tos">Terms of Service</Link>
      <span className={s.spacer}>·</span>
      <Link to="/app/privacy">Privacy Policy</Link>
      <span className={s.spacer}>·</span>
      <Link to="/app/main">Support</Link> */}
    </div>
  </footer>
);

Footer.propTypes = {
  className: PropTypes.string,
};

Footer.defaultProps = {
  className: '',
};

export default Footer;
