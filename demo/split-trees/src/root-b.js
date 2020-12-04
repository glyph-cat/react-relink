import Markdown from 'markdown-to-jsx';
import React from 'react';
import { useEditorValue } from './editor-source';
import './root-b.css';

function RootB() {
  const editorValue = useEditorValue();
  return (
    <div className='root-b-container'>
      <div className='root-b-subcontainer'>
        <header className='root-b-header'>
          <h1>Preview Area</h1>
        </header>
        <div className='root-b-md-display' tabIndex={0}>
          <Markdown children={editorValue} />
        </div>
      </div>
    </div>
  );
}

export default RootB;
