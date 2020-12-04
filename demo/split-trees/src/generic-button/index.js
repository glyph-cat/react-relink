import React from 'react';
import './index.css';

export default function GenericButton({ label, onClick }) {
  return (
    <button
      className='generic-button'
      children={label}
      onClick={onClick}
      tabIndex={0}
    />
  );
}
