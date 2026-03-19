export type DetailMode =
  | "current-node-detail"
  | "child-list"
  | "mixed"
  | "summary";

export type TreeLoadMode = "full" | "lazy" | "root-filtered";

export type DeletePolicy =
  | "block-when-children-exist"
  | "cascade-delete-descendants"
  | "soft-delete"
  | "unbind-related-records";

export type SelectionBehavior =
  | "fetch-detail"
  | "refresh-child-list"
  | "fetch-detail-and-refresh-children";

export interface TreeFieldMap {
  nodeIdField: string;
  parentIdField: string;
  nodeLabelField: string;
  nodeSortField?: string;
  rootParentValue?: string | number | null;
  statusField?: string;
  pathField?: string;
  leafFlagField?: string;
}

export interface TreeQueryConfig {
  loadMode: TreeLoadMode;
  defaultSelectedNodeId?: string | number | null;
  expandRootOnLoad?: boolean;
  allowSearch?: boolean;
  allowDragDrop?: boolean;
  searchPlaceholder?: string;
}

export interface DetailFieldConfig {
  field: string;
  label: string;
  component: string;
  required?: boolean;
  readonly?: boolean;
  visible?: boolean;
  defaultValue?: string | number | boolean | null;
}

export interface DetailPanelConfig {
  mode: DetailMode;
  entity: string;
  entityIdField: string;
  titleField?: string;
  fields: DetailFieldConfig[];
  tabs?: string[];
}

export interface OperationConfig {
  enabled: boolean;
  trigger: "toolbar" | "context-menu" | "detail-header" | "row-action";
  scope: "root" | "current-node" | "child-node" | "sibling-node";
  requiredFields?: string[];
  inheritFieldsFromParent?: string[];
  resetSelectionAfterSuccess?: boolean;
  confirmMessage?: string;
}

export interface DeleteConfig {
  enabled: boolean;
  policy: DeletePolicy;
  confirmMessage: string;
  fallbackSelectedNodeStrategy:
    | "select-parent"
    | "select-next-sibling"
    | "clear-selection";
}

export interface ApiConfig {
  fetchTree: string;
  fetchDetail: string;
  createNode: string;
  updateNode: string;
  deleteNode: string;
  moveNode?: string;
  fetchChildren?: string;
}

export interface TreeDetailPageConfig {
  sceneName: string;
  treeEntity: string;
  detailEntity: string;
  detailMode: DetailMode;
  selectionBehavior: SelectionBehavior;
  uniquenessRules: string[];
  permissionRules: string[];
  fieldMap: TreeFieldMap;
  treeQuery: TreeQueryConfig;
  detailPanel: DetailPanelConfig;
  operations: {
    query: OperationConfig;
    create: OperationConfig;
    update: OperationConfig;
    delete: DeleteConfig;
    move?: OperationConfig;
  };
  api: ApiConfig;
}

export const treeDetailTemplate: TreeDetailPageConfig = {
  sceneName: "department-management",
  treeEntity: "department",
  detailEntity: "departmentProfile",
  detailMode: "current-node-detail",
  selectionBehavior: "fetch-detail",
  uniquenessRules: ["nodeLabel must be unique among siblings"],
  permissionRules: ["only admins can delete nodes"],
  fieldMap: {
    nodeIdField: "deptId",
    parentIdField: "parentDeptId",
    nodeLabelField: "deptName",
    nodeSortField: "sortOrder",
    rootParentValue: 0,
    statusField: "status",
    pathField: "deptPath",
    leafFlagField: "isLeaf"
  },
  treeQuery: {
    loadMode: "full",
    defaultSelectedNodeId: null,
    expandRootOnLoad: true,
    allowSearch: true,
    allowDragDrop: false,
    searchPlaceholder: "Search department"
  },
  detailPanel: {
    mode: "current-node-detail",
    entity: "departmentProfile",
    entityIdField: "deptId",
    titleField: "deptName",
    fields: [
      { field: "deptName", label: "Department Name", component: "input", required: true },
      { field: "leaderId", label: "Leader", component: "user-select" },
      { field: "status", label: "Status", component: "select", required: true },
      { field: "remark", label: "Remark", component: "textarea" }
    ],
    tabs: ["basic", "members", "audit"]
  },
  operations: {
    query: {
      enabled: true,
      trigger: "toolbar",
      scope: "current-node",
      resetSelectionAfterSuccess: false
    },
    create: {
      enabled: true,
      trigger: "toolbar",
      scope: "child-node",
      requiredFields: ["deptName", "parentDeptId"],
      inheritFieldsFromParent: ["status"],
      resetSelectionAfterSuccess: true
    },
    update: {
      enabled: true,
      trigger: "detail-header",
      scope: "current-node",
      requiredFields: ["deptId", "deptName", "status"],
      resetSelectionAfterSuccess: false
    },
    delete: {
      enabled: true,
      policy: "block-when-children-exist",
      confirmMessage: "Delete the selected department?",
      fallbackSelectedNodeStrategy: "select-parent"
    },
    move: {
      enabled: false,
      trigger: "context-menu",
      scope: "current-node",
      requiredFields: ["deptId", "parentDeptId", "sortOrder"],
      resetSelectionAfterSuccess: false
    }
  },
  api: {
    fetchTree: "/api/department/tree",
    fetchDetail: "/api/department/detail",
    createNode: "/api/department/create",
    updateNode: "/api/department/update",
    deleteNode: "/api/department/delete",
    moveNode: "/api/department/move"
  }
};
