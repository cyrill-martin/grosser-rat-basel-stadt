<script setup>
import { h, ref, computed, watch } from "vue"
import { NDataTable, NSpin, NTooltip } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"
import { AddCircleOutline, CheckmarkOutline } from "@vicons/ionicons5"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const council = useCouncilStore()

function createColumns({ importVoteResults }) {
  return [
    {
      title: t("votesTable.header.column1"),
      key: "voteTitle",
      render(row) {
        return h("div", [
          h("div", row.voteDate),
          row.voteSignature
            ? h(
                "a",
                {
                  href: `https://grosserrat.bs.ch/?gnr=${row.voteSignature}`,
                  target: "_blank",
                  style: {
                    cursor: "pointer",
                    color: "inherit"
                  }
                },
                row.voteTitle
              )
            : row.voteTitle
        ])
      }
    },
    {
      title: "",
      key: "voteImport",
      align: "center",
      render(row) {
        const icon = row.voteImported ? CheckmarkOutline : AddCircleOutline
        return h(
          NTooltip,
          {
            trigger: "hover",
            placement: "left"
          },
          {
            trigger: () =>
              h(icon, {
                width: 25,
                height: 25,
                onClick: () => (row.voteImported ? null : importVoteResults(row)),
                style: {
                  cursor: row.voteImported ? null : "pointer",
                  align: "center"
                }
              }),
            default: () =>
              row.voteImported
                ? t("votesTable.tooltip.resultsImported")
                : t("votesTable.tooltip.importResults")
          }
        )
      }
    }
  ]
}

async function importVoteResults(rowData) {
  council.getVoteResults(rowData)
  rowData.voteImported = true
}

const columns = createColumns({ importVoteResults })

const tableData = computed(() => {
  return council.asOfDate && council.listOfVotesAsOfDate.length
    ? council.listOfVotesAsOfDate
    : council.listOfVotesCurrent
})

watch(
  () => council.listOfVotesAsOfDate,
  (newValue) => {
    if (!newValue.length) {
      // This means the user went back to the current council (or changed the date?)
      pagination.value.page = 1
      pagination.value.pageCount = tableData.value.length / council.listOfVotesPageSize
    }

    if (newValue.length) {
      // This means the user went for the council as of date
      // Only reset page and pageCount if it's the initial change of the list
      if (newValue.length <= council.listOfVotesSize) {
        pagination.value.page = 1
        pagination.value.pageCount = 4
      }
    }
  }
)

// Pagination
// Set pageCount to council.listOfVotesSize / council.listOfVotesPageSize but don't compute it
const pagination = ref({
  page: 1,
  pageSize: council.listOfVotesPageSize,
  pageCount: 4,
  pageSlot: 7
})

const showSpinner = ref(false)
function setSpinner() {
  showSpinner.value = !showSpinner.value
}

async function handlePageChange(pageNr) {
  console.log(pagination.value)
  pagination.value.page = pageNr

  if (pageNr === pagination.value.pageCount) {
    setSpinner()
    await council.fetchRecentListOfVotes(council.listOfVotesPageSize, tableData.value.length)
    pagination.value.pageCount += 1
    setSpinner()
  }
}
</script>

<template>
  <div>
    <n-data-table
      v-if="tableData"
      size="small"
      :columns="columns"
      :data="tableData"
      :pagination="pagination"
      @update:page="handlePageChange"
    >
      <template #empty>...</template></n-data-table
    >
    <div class="page-loading-spinner">
      <n-spin v-if="showSpinner" size="small"></n-spin>
    </div>
  </div>
</template>

<style scoped>
.n-data-table :deep(.n-data-table__pagination) {
  justify-content: center !important;
}

a {
  color: inherit;
}

.page-loading-spinner {
  text-align: center;
}
</style>
