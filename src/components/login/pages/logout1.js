"use client"
import './css/logout1.css';
import FormStyle_1 from '../forms/form_style1';
import './../../global.css';
import { logout } from '@/global';
import Frame_AestheticMetadataPanel from '@/components/miscellaneous/frame_aesthetic_metadata_panel';

export default function Logout1() {
  return (
    <Frame_AestheticMetadataPanel>
      <FormStyle_1 header="Logout">
        <div className='FormStyle_1_div'>
          <button onClick={() => { logout(); }} className='FormStyle_1_div_login_button'>Yes</button>
          <button onClick={() => { window.close(); }} className='FormStyle_1_div_login_button'>No</button>
        </div>
      </FormStyle_1>
    </Frame_AestheticMetadataPanel>
  );
}
