import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ChevronRightIcon, DeleteIcon, HamburgerIcon, PencilIcon, PlusIcon, SearchIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';
import { useImageStore } from '../stores/imageStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { t } from 'i18next';
import { cn } from '../utils/cn';
import { Workspace } from '../types';
import { EditWorkspaceModal } from '../components/workspace/EditWorkspaceModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NewWorkspaceModal } from '../components/workspace/NewWorkspaceModal';
import { useCategoryStore } from '../stores/categoryStore';
import { useNavigate } from 'react-router-dom';

export default () => {
  const { searchQuery, setSearchQuery } = useImageStore();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { currentWorkspace, updateWorkspace, addWorkspace, workspaces, switchWorkspace, deleteWorkspace } = useWorkspaceStore();
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);

  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = useState(false);

  const [showDeleteWorkspaceConfirm, setShowDeleteWorkspaceConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const navigate = useNavigate()

  // 重写工作区切换方法以添加加载状态
  const handleWorkspaceSwitch = async (workspaceId: string) => {
    try {
      switchWorkspace(workspaceId);
    } finally {
    }
  };


  const handleClearAll = () => {
    const isFavoritePage = location.pathname === '/favorites';
    useImageStore.getState().deleteAllImages(isFavoritePage);
    useCategoryStore.getState().clearCategories();

    // 如果在分类页面，重定向到首页
    if (location.pathname !== '/home' && location.pathname !== '/favorites') {
      navigate('/home');
    }
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center border-b border-base-300 bg-base-100 px-10 justify-between" style={{ zIndex: 200 }}>
      {/* Logo */}
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold">IconEase</span>

        <span className="rounded bg-primary px-2 py-0.5 text-xs text-white">Beta</span>
      </div>

      {/* Search */}
      <div className="relative max-w-xl flex-1 px-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="input input-bordered w-full pl-10 input-sm"
        />
        <SearchIcon className="absolute left-11 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/50" />
      </div>

      {/* Menu Button */}
      <Menu as="div" className="relative focus:outline-none outline-none">
        <MenuButton className="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-black/5 rounded-md outline-none">
          <span className="mr-2">{currentWorkspace?.name}</span>
          <HamburgerIcon className="h-4 w-4" />
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-2 w-64 p-2 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none ">
            {/* 工作区列表 */}
            <div className="text-gray-400 text-sm font-medium px-4 py-2">
              <span>{t('workspace.title')}</span>
            </div>

            {workspaces.map(workspace => (
              <MenuItem key={workspace.id}>
                <div className="px-2 hover:bg-gray-100 transition rounded-lg">
                  <button
                    onClick={() => {
                      handleWorkspaceSwitch(workspace.id);
                    }}
                    className="flex w-full items-center gap-2 px-2 text-sm py-2 text-gray-600 hover:text-gray-900 rounded-md cursor-pointer"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full me-2",
                        workspace.id === currentWorkspace?.id ? "bg-blue-500" : "bg-gray-300"
                      )} />
                      <span>{workspace.name}</span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkspaceToEdit(workspace);
                          setShowEditWorkspaceModal(true);
                        }}
                        className="p-1 hover:bg-black/5 rounded-md"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkspaceToDelete(workspace.id);
                          setShowDeleteWorkspaceConfirm(true);
                        }}
                        className="p-1 hover:bg-black/5 rounded-md"
                      >
                        <DeleteIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                </div>
              </MenuItem>
            ))}

            {/* 新建工作区按钮 */}
            <MenuItem>
              <div className="px-2 transition hover:bg-gray-100 rounded-lg">
                <button
                  onClick={() => setShowWorkspaceModal(true)}
                  className="flex w-full items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>{t('workspace.new')}</span>
                </button>
              </div>
            </MenuItem>

            <div className="my-3 h-px bg-gray-200" />

            {/* 设置菜单组 */}
            <div className="text-gray-400 text-sm font-medium px-4 py-2">
              <span>{t('settings.title')}</span>
            </div>

            {/* 语言切换 */}
            <Menu as="div" className="relative w-full">
              {({ open }) => (
                <>
                  <MenuButton className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 transition rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>{t('settings.language')}</span>
                    <span className="ml-auto text-gray-400">
                      {currentLanguage === 'zh' ? '中文' : 'English'}
                    </span>
                    <ChevronRightIcon
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        open && "rotate-90"
                      )}
                    />
                  </MenuButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-full top-0 mr-1 w-40 p-2 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <MenuItem>
                        <button
                          onClick={() => changeLanguage('en')}
                          className={cn(
                            "flex w-full items-center px-4 py-2 text-sm rounded-md",
                            currentLanguage === 'en' && 'text-blue-500'
                          )}
                        >
                          English
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() => changeLanguage('zh')}
                          className={cn(
                            "flex w-full items-center px-4 py-2 text-sm rounded-md",
                            currentLanguage === 'zh' && 'text-blue-500'
                          )}
                        >
                          中文
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Transition>
                </>
              )}
            </Menu>

            {/* Reset 按钮 */}
            <MenuItem>
              <div className="px-2 hover:bg-gray-100 transition rounded-md">
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="flex w-full items-center gap-2 px-2 py-2 rounded-md cursor-pointer"
                >
                  <DeleteIcon className="h-4 w-4" />
                  <span>{t('common.reset')}</span>
                </button>
              </div>
            </MenuItem>

            {/* Export Config */}
            <MenuItem>
              <div className="px-2">
                <button
                  className={cn(
                    "flex w-full items-center gap-2 px-2 py-2 rounded-md cursor-pointer",
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{t('settings.export.title')}</span>
                </button>
              </div>
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>


      {/* Confirm Clear Modal */}
      <dialog className={cn('modal', isConfirmModalOpen && 'modal-open')}>
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">{t('settings.reset.title')}</h3>
          <p className="py-4">{t('settings.reset.content')}</p>
          <div className="modal-action">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={handleClearAll}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={() => setIsConfirmModalOpen(false)}
        >
          <button>close</button>
        </form>
      </dialog>

      <EditWorkspaceModal
        isOpen={showEditWorkspaceModal}
        workspace={workspaceToEdit}
        onClose={() => {
          setShowEditWorkspaceModal(false);
          setWorkspaceToEdit(null);
        }}
        onConfirm={(name) => {
          if (workspaceToEdit) {
            updateWorkspace(workspaceToEdit.id, name);
          }
          setShowEditWorkspaceModal(false);
          setWorkspaceToEdit(null);
        }}
      />

      {/* 删除工作区确认 */}
      <ConfirmDialog
        isOpen={showDeleteWorkspaceConfirm}
        title={t('workspace.delete.title')}
        content={t('workspace.delete.content')}
        type="error"
        onConfirm={() => {
          if (workspaceToDelete) {
            deleteWorkspace(workspaceToDelete);
          }
          setShowDeleteWorkspaceConfirm(false);
          setWorkspaceToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteWorkspaceConfirm(false);
          setWorkspaceToDelete(null);
        }}
      />

      {/* 新建工作区 Modal */}
      <NewWorkspaceModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        onConfirm={(name) => {
          addWorkspace(name);
          setShowWorkspaceModal(false);
        }}
      />

    </div>
  )
};
