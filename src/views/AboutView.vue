<script setup>
import { NFlex } from "naive-ui"
</script>

<template>
  <n-flex vertical>
    <div class="about-column" style="flex: 1">
      <p>
        Die vorliegende Website ist ein unabhängiges Projekt, das auf Daten von
        <a href="https://data.bs.ch/pages/home/" target="_blank">Open Data Basel-Stadt</a>
        basiert. Sie ist keine offizielle Veröffentlichung und wurde nicht von der Stadt Basel in
        Auftrag gegeben.
      </p>

      <p>
        Die zugrunde liegenden Daten stammen vom Statistischen Amt Basel-Stadt. Die Daten werden
        direkt vom Browser über die Schnittstellen vom Statistischen Amt bezogen und
        weiterverarbeitet. Folgende Datensätze werden verwendet:
      </p>

      <ul>
        <li>
          <a href="https://data.bs.ch/explore/dataset/100307/information/" target="_blank">
            Grosser Rat: Ratsmitgliedschaften
          </a>
        </li>
        <li>
          <a href="https://data.bs.ch/explore/dataset/100308/information/" target="_blank">
            Grosser Rat: Mitgliedschaften in Gremien
          </a>
        </li>
        <li>
          <a href="https://data.bs.ch/explore/dataset/100309/information/" target="_blank">
            Grosser Rat: Interessensbindungen Ratsmitglieder
          </a>
        </li>
        <li>
          <a href="https://data.bs.ch/explore/dataset/100311/information/" target="_blank">
            Grosser Rat: Geschäfte
          </a>
        </li>
        <li>
          <a href="https://data.bs.ch/explore/dataset/100186/information/" target="_blank">
            Grosser Rat: Live-Abstimmungsergebnisse
          </a>
        </li>
      </ul>

      <p>
        Der Code für die Website und die Visualisierungen ist hier verfügbar:<br />
        <a href="https://github.com/cyrill-martin/grosser-rat-basel-stadt" target="_blank"
          >https://github.com/cyrill-martin/<br />grosser-rat-basel-stadt</a
        >.
      </p>
    </div>
    <div class="about-column" style="flex: 1">
      <p>
        Dies ist eine Test-Seite, das Projekt ist "in progress".<br />Feedback ist willkommen
        ¯\_(ツ)_/¯
      </p>
    </div>
    <div class="about-column" style="flex: 1">
      <n-flex>
        <div style="flex: 1">
          <p><img src="../assets/kmapper_k.png" alt="The small kmapper k logo" /></p>
        </div>
        <div style="flex: 25">
          <p>
            Cyrill Martin <br />
            <a href="https://kmapper.com" target="_blank">kmapper GmbH</a><br />
            <a href="mailto:cyrill.martin@kmapper.com">cyrill.martin@kmapper.com</a>
          </p>
        </div>
      </n-flex>
    </div>
  </n-flex>
</template>

<style scoped>
.about-column {
  margin: auto;
  width: 75%;
}

img {
  height: 60px;
}

@media only screen and (max-width: 1200px) {
  .about-column {
    margin: auto;
    width: 100%;
    font-size: 12px;
  }
  img {
    height: 57px;
  }
}
</style>
