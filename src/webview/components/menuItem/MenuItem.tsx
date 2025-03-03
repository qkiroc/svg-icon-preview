import React from 'react';
import cx from 'classnames';

export default function MenuItem(props: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      className={cx('icon-menu-item', props.className)}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
