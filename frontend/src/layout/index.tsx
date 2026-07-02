import { useState } from "react";
import {
  Bell,
  Bot,
  ChartLine,
  ChevronLeft,
  CircleAlert,
  Flag,
  GitBranch,
  LogOut,
  Settings,
  SlidersHorizontal,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

type NavItem = {
  label: string;
  path: string;
  Icon: LucideIcon;
};

type NavGroupKey = "system" | "feedback";

const primaryNavItems: NavItem[] = [
  {
    label: "智能问数",
    path: "/chat",
    Icon: Bot,
  },
];

const systemNavItems: NavItem[] = [
  {
    label: "应用配置",
    path: "/settings",
    Icon: SlidersHorizontal,
  },
];

const feedbackNavItems: NavItem[] = [
  {
    label: "回复校对",
    path: "/feedbacks",
    Icon: CircleAlert,
  },
];

const renderNavItem = (item: NavItem) => {
  const { Icon } = item;

  return (
    <NavLink className="side-nav-link" to={item.path} key={item.path}>
      <Icon size={17} strokeWidth={2.2} />
      <span>{item.label}</span>
    </NavLink>
  );
};

const Layout = () => {
  const [openGroups, setOpenGroups] = useState<Record<NavGroupKey, boolean>>({
    system: true,
    feedback: true,
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mainNavCollapsed, setMainNavCollapsed] = useState(false);

  const toggleGroup = (groupKey: NavGroupKey) => {
    setOpenGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

  return (
    <div className="app-layout">
      <header className="top-bar">
        <div className="top-brand">
          <ChartLine size={18} strokeWidth={2.4} />
          <span>经管之星</span>
        </div>

        <div className="top-right">
          <button className="top-icon-button" type="button" title="消息通知">
            <Bell size={18} strokeWidth={2.2} />
            <span className="badge-dot" />
          </button>

          <div className="top-avatar-wrap">
            <button
              className="top-avatar"
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              管
            </button>

            {userMenuOpen && (
              <div className="top-dropdown">
                <button type="button">
                  <User size={15} />
                  个人信息
                </button>
                <div className="top-dropdown-version">
                  <GitBranch size={15} />
                  v1.0.0
                </div>
                <button className="danger" type="button">
                  <LogOut size={15} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className={`app-body ${mainNavCollapsed ? "is-nav-collapsed" : ""}`}>
        <aside className={`side-nav ${mainNavCollapsed ? "is-collapsed" : ""}`}>
          <nav className="side-nav-primary" aria-label="主导航">
            {primaryNavItems.map(renderNavItem)}
          </nav>

          <nav className="side-nav-group" aria-label="系统管理">
            <button
              className={`side-nav-group-title ${openGroups.system ? "is-open" : ""}`}
              type="button"
              aria-expanded={openGroups.system}
              onClick={() => toggleGroup("system")}
            >
              <Settings size={16} strokeWidth={2.4} />
              <span>系统管理</span>
              <i aria-hidden="true" />
            </button>
            <div
              className={`side-nav-submenu ${openGroups.system ? "is-open" : ""}`}
              aria-hidden={!openGroups.system}
            >
              <div className="side-nav-submenu-content">
                {systemNavItems.map(renderNavItem)}
              </div>
            </div>
          </nav>

          <nav className="side-nav-group" aria-label="反馈管理">
            <button
              className={`side-nav-group-title ${openGroups.feedback ? "is-open" : ""}`}
              type="button"
              aria-expanded={openGroups.feedback}
              onClick={() => toggleGroup("feedback")}
            >
              <Flag size={16} strokeWidth={2.4} />
              <span>反馈管理</span>
              <i aria-hidden="true" />
            </button>
            <div
              className={`side-nav-submenu ${openGroups.feedback ? "is-open" : ""}`}
              aria-hidden={!openGroups.feedback}
            >
              <div className="side-nav-submenu-content">
                {feedbackNavItems.map(renderNavItem)}
              </div>
            </div>
          </nav>
          <div className="side-nav-footer">
            <button
              className="side-nav-collapse-button"
              type="button"
              title={mainNavCollapsed ? "展开侧边栏" : "收起侧边栏"}
              onClick={() => setMainNavCollapsed((collapsed) => !collapsed)}
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>
          </div>
        </aside>

        <section className="app-layout-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Layout;
