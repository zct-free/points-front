<template>
  <a-select v-bind="$attrs" v-model:value="value">
    <a-select-option :value="null">{{ props.defaultOption }}</a-select-option>
    <a-select-option v-for="option in options" :key="option.dictValue" :value="option.dictValue"
      >{{ option.dictLabel }}
    </a-select-option>
  </a-select>
</template>
<script setup>
import { useDictStore } from "@/store/dict";
import { onMounted, ref, watch } from "vue";
const props = defineProps({
  dictType: {
    type: String,
    required: true,
  },
  defaultOption: {
    type: String,
    default: "全部",
  },
});
const dictStore = useDictStore();
const options = ref([]);
const loadOptions = async () => {
  if (!dictStore.dictData[props.dictType]) {
    await dictStore.loadDictData(props.dictType);
  }
  options.value =
    dictStore.dictData[props.dictType]?.map(item => ({
      ...item,
      label: item.dictLabel,
      value: item.dictValue,
    })) || [];
};
watch(() => props.dictType, loadOptions, { immediate: true });
onMounted(() => {
  loadOptions();
});
const value = defineModel("value");
</script>
