export type NavItem = {
  label: string;
  href: string;
  icon: string; // nome do ícone lucide-react
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Menu principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Produtos", href: "/produtos", icon: "Package" },
      { label: "Categorias", href: "/categorias", icon: "Tags" },
      { label: "Vendas", href: "/vendas", icon: "ShoppingCart" },
      { label: "Serviços", href: "/servicos", icon: "Wrench" },
      { label: "Canais", href: "/canais", icon: "Radio" },
      { label: "Pagamentos", href: "/pagamentos", icon: "CreditCard" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Fluxo de caixa", href: "/financeiro/caixa", icon: "Wallet" },
      { label: "Contas a receber", href: "/financeiro/receber", icon: "Receipt" },
      { label: "Gastos", href: "/financeiro/gastos", icon: "ArrowDownCircle" },
      { label: "Analytics", href: "/financeiro/analytics", icon: "BarChart3" },
      { label: "Relatórios", href: "/financeiro/relatorios", icon: "FileText" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Catálogo", href: "/marketing/catalogo", icon: "BookImage" },
      { label: "Loja virtual", href: "/marketing/loja", icon: "Store" },
      { label: "Indique e ganhe", href: "/marketing/indique", icon: "Gift" },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { label: "Clientes", href: "/clientes", icon: "Users" },
      { label: "Fornecedores", href: "/fornecedores", icon: "Truck" },
    ],
  },
  {
    label: "Configuração",
    items: [{ label: "Perfil", href: "/perfil", icon: "UserCircle" }],
  },
];
