import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import { usersApi } from '@/services/api';
import type { ManagedUser, CreateUserRequest, UpdateUserRequest } from '@/types';
import { Header } from '@/components/layout/Header';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface OutletCtx { onMobileMenuOpen: () => void }

// ── Org tree definition ───────────────────────────────────────────────────────
interface OrgNode { id: number; children: OrgNode[] }

const ORG_TREE: OrgNode = {
  id: 1, // مدیر کل
  children: [{
    id: 6, // رئیس اداره
    children: [
      {
        id: 7, // کارشناس نشریات
        children: [
          {
            id: 10, // دستیار علمی
            children: [
              { id: 2,  children: [] }, // سارا - دستیار
              { id: 11, children: [] }, // فاطمه - همکار
              { id: 13, children: [] }, // آرزو - همکار
            ],
          },
        ],
      },
      {
        id: 8, // مسئول کارگاه
        children: [
          {
            id: 9, // دستیار فناوری
            children: [
              { id: 3,  children: [] }, // رضا - دستیار
              { id: 12, children: [] }, // سینا - همکار
            ],
          },
          { id: 4,  children: [] }, // مریم
          { id: 5,  children: [] }, // حسن
        ],
      },
    ],
  }],
};

// ── Role colours ──────────────────────────────────────────────────────────────
const ROLE_STYLE: Record<string, { card: string; badge: string; dot: string }> = {
  admin:     { card: 'border-[#2174b8] shadow-[0_4px_16px_rgba(33,116,184,0.18)]', badge: 'bg-[#f0f7fd] text-[#2174b8] border-[#aed2ef]', dot: 'bg-[#2174b8]' },
  assistant: { card: 'border-[#7fa343] shadow-[0_4px_16px_rgba(127,163,67,0.15)]', badge: 'bg-[#f3f8ec] text-[#55702d] border-[#c7e0a7]',  dot: 'bg-[#7fa343]' },
  viewer:    { card: 'border-gray-200  shadow-card',                                 badge: 'bg-gray-50   text-gray-500 border-gray-200',      dot: 'bg-gray-400' },
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'مدیر کل', assistant: 'دستیار', viewer: 'همکار دانشجو',
};

// ── Connector line colours ────────────────────────────────────────────────────
const LINE = 'bg-gray-300';

// ── Single node card ──────────────────────────────────────────────────────────
const NodeCard: React.FC<{
  user: ManagedUser;
  isAdmin: boolean;
  onEdit: (u: ManagedUser) => void;
}> = ({ user, isAdmin, onEdit }) => {
  const s = ROLE_STYLE[user.role] ?? ROLE_STYLE.viewer;
  return (
    <div className={`relative bg-white rounded-2xl border-2 p-4 w-52 flex-shrink-0 transition-shadow ${s.card} ${!user.is_active ? 'opacity-50' : ''}`}>
      {/* Avatar */}
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2174b8, #7fa343)' }}
        >
          {user.full_name.charAt(0)}
        </div>
        <div className="min-w-0 w-full">
          <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
          {user.position && (
            <p className="text-[11px] text-gray-500 mt-0.5 leading-4 line-clamp-2">{user.position}</p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
        {!user.is_active && (
          <span className="text-[10px] text-red-400 font-medium">غیرفعال</span>
        )}
      </div>
      {/* Edit button (admin only) */}
      {isAdmin && (
        <button
          onClick={() => onEdit(user)}
          className="absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-[#2174b8] hover:bg-[#f0f7fd] transition-colors"
          title="ویرایش"
        >
          <Pencil size={12} />
        </button>
      )}
    </div>
  );
};

// ── Recursive tree renderer ───────────────────────────────────────────────────
const TreeNode: React.FC<{
  node: OrgNode;
  userMap: Map<number, ManagedUser>;
  isAdmin: boolean;
  onEdit: (u: ManagedUser) => void;
}> = ({ node, userMap, isAdmin, onEdit }) => {
  const user = userMap.get(node.id);
  if (!user) return null;

  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <NodeCard user={user} isAdmin={isAdmin} onEdit={onEdit} />

      {hasChildren && (
        <>
          {/* Vertical line down from card */}
          <div className={`w-0.5 h-6 ${LINE}`} />

          {/* Children row */}
          <div className="relative flex items-start gap-0">
            {/* Horizontal connector spanning all children */}
            {node.children.length > 1 && (
              <div
                className={`absolute top-0 h-0.5 ${LINE}`}
                style={{
                  left:  '50%',
                  right: '50%',
                  // Will be overridden by the actual span below; we draw it via a wrapper trick
                }}
              />
            )}
            {node.children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center px-3">
                {/* Horizontal arm + vertical down to child */}
                <div className="relative flex flex-col items-center">
                  {/* Vertical line from horizontal bar down to child card */}
                  <div className={`w-0.5 h-6 ${LINE}`} />
                  <TreeNode node={child} userMap={userMap} isAdmin={isAdmin} onEdit={onEdit} />
                </div>
                {/* Invisible spacer so the outer horizontal line works */}
                {i === 0 && node.children.length > 1 && null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// We need a proper horizontal line that spans from first to last child.
// Replace TreeNode with a version that calculates the span correctly using a wrapper:

const TreeBranch: React.FC<{
  node: OrgNode;
  userMap: Map<number, ManagedUser>;
  isAdmin: boolean;
  onEdit: (u: ManagedUser) => void;
}> = ({ node, userMap, isAdmin, onEdit }) => {
  const user = userMap.get(node.id);
  if (!user) return null;

  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <NodeCard user={user} isAdmin={isAdmin} onEdit={onEdit} />

      {hasChildren && (
        <>
          <div className={`w-0.5 h-6 ${LINE}`} />

          <div className="flex items-start">
            {node.children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center relative px-4">
                {/* Top horizontal arm segments — drawn as top border */}
                <div className="flex w-full">
                  {/* Left half */}
                  <div className={`flex-1 h-0.5 ${idx === 0 ? 'bg-transparent' : LINE}`} />
                  {/* Right half */}
                  <div className={`flex-1 h-0.5 ${idx === node.children.length - 1 ? 'bg-transparent' : LINE}`} />
                </div>
                {/* Vertical down */}
                <div className={`w-0.5 h-6 ${LINE}`} />
                <TreeBranch node={child} userMap={userMap} isAdmin={isAdmin} onEdit={onEdit} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export const OrgChartPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  const [userMap,    setUserMap]    = useState<Map<number, ManagedUser>>(new Map());
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editUser,   setEditUser]   = useState<ManagedUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const users = await usersApi.list();
    setUserMap(new Map(users.map(u => [u.id, u])));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEdit   = (u: ManagedUser) => { setEditUser(u); setModalOpen(true); };
  const handleCreate = () => { setEditUser(null); setModalOpen(true); };

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (editUser) {
      await usersApi.update(editUser.id, data as UpdateUserRequest);
      success('ذخیره شد', 'اطلاعات کاربر به‌روز شد');
    } else {
      await usersApi.create(data as CreateUserRequest);
      success('افزوده شد', 'کاربر جدید ایجاد شد');
    }
    load();
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editUser={editUser}
      />

      <Header
        title="نمودار سازمانی"
        subtitle="ساختار سلسله‌مراتبی تیم باشگاه پژوهشگران جوان"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          isAdmin ? (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">کاربر جدید</span>
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#2174b8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-6 px-1">
              {Object.entries(ROLE_LABEL).map(([role, label]) => (
                <div key={role} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${ROLE_STYLE[role].dot}`} />
                  <span className="text-xs text-white/80">{label}</span>
                </div>
              ))}
              <span className="text-xs text-white/40 mr-2">· کلیک روی ✏ برای ویرایش</span>
            </div>

            {/* Tree — horizontally scrollable on small screens */}
            <div className="overflow-x-auto pb-6">
              <div className="inline-flex min-w-full justify-center px-4">
                <TreeBranch
                  node={ORG_TREE}
                  userMap={userMap}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrgChartPage;
