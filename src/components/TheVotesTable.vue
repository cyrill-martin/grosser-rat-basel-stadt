<script setup>
import { ref, h, computed } from "vue"
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

const pagination = ref({
  pageSize: 10
})

const tableData = computed(() => {
  return council.asOfDate && council.listOfVotesAsOfDate
    ? council.listOfVotesAsOfDate
    : council.listOfVotesCurrent
})
</script>

<template>
  <div>
    <n-data-table
      v-if="council.listOfVotesCurrent"
      size="small"
      :columns="columns"
      :data="tableData"
      :pagination="pagination"
    />
  </div>
</template>
