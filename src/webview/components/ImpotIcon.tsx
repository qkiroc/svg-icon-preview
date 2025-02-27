import Popover from 'antd/es/popover';
import CreateIcon from '../icons/CreateIcon';
import Modal from 'antd/es/modal';
import React from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Switch from 'antd/es/switch';

export default function ImportIcon() {
  const projectConfig = window.projectConfig!;
  const icons = window.icons || [];
  const [showModal, setShowModal] = React.useState(false);
  const [form] = Form.useForm();
  const [file, setFile] = React.useState<{
    name: string;
    content: string;
  }>();

  function handleImportIcon(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const name = file.name.replace(/.svg|.SVG$/, '');
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      setFile({
        name,
        content: reader.result as string
      });
      setShowModal(true);
    };
  }

  function handleConfirm(values: any) {
    const { name, needColor } = values;
    window.vscode.postMessage({
      type: 'importIcon',
      data: {
        name,
        needColor,
        content: file?.content,
        ...projectConfig
      }
    });
    setShowModal(false);
  }

  return (
    <>
      <Popover content='导入图标' placement='left' className='popover'>
        <label className='import-icon'>
          <input type='file' accept='.svg' onChange={handleImportIcon} />
          <CreateIcon />
        </label>
      </Popover>
      {showModal && (
        <Modal
          title='导入图标'
          open={true}
          onCancel={() => setShowModal(false)}
          okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
          okText='确认'
          cancelText='取消'
          destroyOnClose
          modalRender={dom => (
            <Form initialValues={file} onFinish={handleConfirm} form={form} clearOnDestroy>
              {dom}
            </Form>
          )}>
          <Form.Item
            label='图标名称'
            name='name'
            rules={[
              {
                validator(rule, value, callback) {
                  if (!value) {
                    callback('请输入图标名称');
                  }
                  if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
                    callback('图标名称只能是英文、数字或-');
                  }
                  if (icons.some((icon: any) => icon.name === value)) {
                    callback('图标名称已存在');
                  }
                  callback();
                }
              }
            ]}>
            <Input />
          </Form.Item>
          <Form.Item name='needColor' label='保留颜色' tooltip='默认会将svg中的fill属性替换为currentColor'>
            <Switch />
          </Form.Item>
          <Form.Item label='图标内容' layout='vertical' className='import-icon-content'>
            {file?.content && (
              <div className='import-icon-preview' dangerouslySetInnerHTML={{ __html: file.content || '' }}></div>
            )}
          </Form.Item>
        </Modal>
      )}
    </>
  );
}
