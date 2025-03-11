import Popover from 'antd/es/popover';
import CreateIcon from '../icons/CreateIcon';
import Modal from 'antd/es/modal';
import React, {useImperativeHandle} from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Switch from 'antd/es/switch';
import message from 'antd/es/message';

export interface ImportIconRefProps {
  onImport: (files: FileList | null) => void;
}

export default React.forwardRef<ImportIconRefProps, {}>(function ImportIcon(
  {},
  ref
) {
  const projectConfig = window.projectConfig!;
  const icons = window.icons || [];
  const [showModal, setShowModal] = React.useState(false);
  const [form] = Form.useForm();
  const [files, setFiles] = React.useState<
    {
      name: string;
      content: string;
    }[]
  >();

  function handleImportIcon(files: FileList | null) {
    if (!files) {
      return;
    }
    let filesArr: {
      name: string;
      content: string;
    }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      if (ext !== 'svg' && ext !== 'SVG') {
        message.error(`${file.name} 不是svg文件`);
        continue;
      }
      const name = file.name.slice(0, -4);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        filesArr.push({
          name,
          content: reader.result as string
        });
        if (filesArr.length === files.length) {
          setFiles(filesArr);
          setShowModal(true);
        }
      };
    }
  }

  function handleConfirm(values: any) {
    const {fileList} = values;

    fileList.forEach((item: any) => {});

    window.vscode.postMessage({
      type: 'importIcon',
      data: fileList.map((item: any) => ({
        name: item.name,
        needColor: item.needColor,
        content: item.content,
        ...projectConfig
      }))
    });

    setShowModal(false);
  }

  useImperativeHandle(ref, () => ({
    onImport: handleImportIcon
  }));

  return (
    <>
      <Popover content="导入图标" placement="left" className="popover">
        <label className="import-icon">
          <input
            type="file"
            accept=".svg"
            onChange={e => handleImportIcon(e.target.files)}
            multiple
          />
          <CreateIcon />
        </label>
      </Popover>
      {showModal && (
        <Modal
          title="导入图标"
          open={true}
          onCancel={() => setShowModal(false)}
          okButtonProps={{autoFocus: true, htmlType: 'submit'}}
          okText="确认"
          cancelText="取消"
          destroyOnClose
          modalRender={dom => (
            <Form
              initialValues={{fileList: files}}
              onFinish={handleConfirm}
              form={form}
              clearOnDestroy
            >
              {dom}
            </Form>
          )}
        >
          <Form.List name="fileList">
            {fields => (
              <>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{
                      marginBottom: 24,
                      borderBottom:
                        index < fields.length - 1
                          ? '1px dashed #d9d9d9'
                          : 'none',
                      paddingBottom: 16
                    }}
                  >
                    <Form.Item
                      {...field}
                      label="图标名称"
                      name={[field.name, 'name']}
                      layout="horizontal"
                      tooltip={{
                        title: '作为文件名和图标使用名',
                        placement: 'right'
                      }}
                      rules={[
                        {
                          validator(rule, value, callback) {
                            if (!value) {
                              callback('请输入图标名称');
                            }
                            if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
                              callback('图标名称只能是英文、数字或-');
                            }
                            if (
                              icons.some((icon: any) => icon.name === value)
                            ) {
                              callback('图标名称已存在');
                            }
                            callback();
                          }
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'needColor']}
                      label="保留颜色"
                      tooltip={{
                        title:
                          '默认会将svg中的fill属性替换为currentColor，如要保留颜色请勾选',
                        placement: 'right'
                      }}
                      layout="horizontal"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label="图标内容"
                      layout="vertical"
                      className="import-icon-content"
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        noStyle
                      >
                        <Input type="hidden" />
                      </Form.Item>
                      <div
                        className="import-icon-preview"
                        dangerouslySetInnerHTML={{
                          __html: files?.[index]?.content || ''
                        }}
                      ></div>
                    </Form.Item>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Modal>
      )}
    </>
  );
});
