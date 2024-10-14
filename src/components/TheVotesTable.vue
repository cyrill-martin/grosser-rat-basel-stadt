<script setup>
import { h, ref, computed, watch } from "vue"
import { NDataTable } from "naive-ui"
import { useCouncilStore } from "../stores/council.js"
import { AddCircleOutline, CheckmarkOutline } from "@vicons/ionicons5"

const council = useCouncilStore()

function createColumns({ importVoteResults }) {
  return [
    {
      title: "Datum",
      key: "voteDate",
      width: 102
    },
    {
      title: "Geschäft",
      key: "voteTitle",
      render(row) {
        if (row.voteSignature) {
          return h(
            "a",
            {
              href: `https://grosserrat.bs.ch/?gnr=${row.voteSignature}`,
              target: "_blank",
              style: {
                cursor: "pointer"
              }
            },
            row.voteTitle
          )
        } else {
          return row.voteTitle
        }
      }
    },
    {
      title: "Resultate",
      width: 100,
      key: "voteImport",
      align: "center",
      render(row) {
        return h(row.voteImported ? CheckmarkOutline : AddCircleOutline, {
          width: 22,
          height: 22,
          onClick: () => (row.voteImported ? null : importVoteResults(row)),
          style: {
            cursor: row.voteImported ? null : "pointer",
            align: "center"
          }
        })
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
      // This means the user went back to the current council
      pagination.value.page = 1
      pagination.value.pageCount = tableData.value.length / council.listOfVotesPageSize
    }
  }
)

watch(
  () => council.listOfVotesAsOfDate,
  (newValue) => {
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
  pageCount: 4
})

const handlePageChange = (pageNr) => {
  pagination.value.page = pageNr
  if (pageNr === pagination.value.pageCount) {
    council.fetchRecentListOfVotes(council.listOfVotesPageSize, tableData.value.length)
    pagination.value.pageCount += 1
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
  </div>
</template>

<style scoped>
.n-data-table :deep(.n-data-table__pagination) {
  justify-content: center !important;
}
</style>
