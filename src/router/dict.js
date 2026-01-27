import { getDictDataApi } from "@/api/dict.js";
import { message } from "ant-design-vue";
import { defineStore } from "pinia";

export const useDictStore = defineStore("dict", {
  state: () => ({
    dictData: {},
    dictMap: {},
    loading: {},
    error: {},
  }),

  actions: {
    // 设置字典数据
    setDictData(dictType, data) {
      this.dictData[dictType] = data?.map(item => ({
        ...item,
        label: item.dictLabel,
        value: item.dictValue,
      }));
      // 创建值到标签的映射
      this.dictMap[dictType] = data.reduce((map, item) => {
        map[item.dictValue] = item.dictLabel;

        return map;
      }, {});
    },

    // 根据字典类型和值获取标签
    getDictLabel(dictType, value) {
      return this.dictMap[dictType]?.[value] || "";
    },
    getDictData(dictType) {
      return this.dictData[dictType] || [];
    },
    getDictMap(dictType) {
      return this.dictMap[dictType] || {};
    },
    async loadDictData(dictType) {
      if (this.dictData[dictType] || this.loading[dictType]) return;
      this.loading[dictType] = true;
      this.error[dictType] = null;
      try {
        const response = await getDictDataApi(dictType);
        this.setDictData(dictType, response?.data || []);
      } catch (err) {
        const errorMsg = err.message || "获取字典数据失败";
        this.error[dictType] = errorMsg;
        message.error(errorMsg);
      } finally {
        this.loading[dictType] = false;
      }
    },

    async loadDictTypes(dictTypes) {
      const promises = dictTypes.map(type => this.loadDictData(type));
      await Promise.all(promises);
    },
    preloadCommonDict() {
      // 预加载常用字典数据的逻辑
      const commonDictTypes = [
        "approval_status",
        "work_exprience",
        "task_status",
        "user_status",
        "question_type",
        "paper_status",
        "test_type",
        "exam_status",
        "regular_evaluation_status",
        "comprehensive_evaluation_status",
        "comprehensive_evaluation_type",
        "offer_status",
        "next_operation",
      ];
      this.loadDictTypes(commonDictTypes);
    },
  },
});
