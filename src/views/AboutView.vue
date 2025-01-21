<script setup>
import { NFlex } from "naive-ui"
</script>

<template>
  <n-flex vertical>
    <div class="about-column" style="flex: 1">
      <p>
        Die vorliegende Website ist ein unabhängiges Projekt, das auf Daten von
        <a href="https://data.bs.ch/pages/home/" target="_blank">Open Data Basel-Stadt</a>
        basiert. Sie ist keine offizielle Veröffentlichung des Grossen Rates Basel-Stadt und wurde
        nicht von der Stadt Basel in Auftrag gegeben.
      </p>
    </div>
    <div class="about-column" style="flex: 1">
      <p>
        Die zugrunde liegenden Daten stammen vom
        <a href="https://www.bs.ch/pd/statistik" target="_blank">Statistischen Amt Basel-Stadt</a>.
        Die Daten werden direkt über die Schnittstellen vom Statistischen Amt bezogen und für die
        Visualisierung transformiert.<br />
        Folgende Datensätze werden verwendet:
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
    </div>
    <div class="about-column" style="flex: 1">
      <p>Folgende Punkte sind zu beachten:</p>
      <ul>
        <li>
          Gewisse Daten sind nur im Zusammenhang mit den aktuell im Amt tätigen Ratsmitgliedern
          verfügbar (aktueller Grosser Rat). Dazu gehören:
        </li>
        <ul>
          <li>Angaben zur Parteizugehörigkeit ("Partei")</li>
          <li>Angaben zu den Interessensbindungen ("Anzahl Interessensbindungen")</li>
          <li>Angaben zum Beruf ("Beruf")</li>
          <li>Foto</li>
        </ul>
        <li>
          Ist "Partei", "Anzahl Interessensbindungen" oder "Beruf" ausgewählt beim Wechsel zu einem
          vergangenen Zustand des Grossen Rates, wird als Ersatz automatisch "Fraktion" gesetzt.
        </li>
        <li>
          Die Angaben zum Beruf werden wie von den Ratsmitgliedern angegeben übernommen und sind
          sehr vielfältig. "Beruf" steht daher nur als Sitzverteilung zur Auswahl, nicht aber als zu
          visualisierendes Merkmal, da eine entsprechende Legende und Farbgebung keinen Mehrwert
          bieten würde.
        </li>
        <li>
          Für die Fokusierung einzelner Ratsmitglieder stehen aktuell zwölf verschiedene Farben zur
          Verfügung. Beginnend vom ersten Ratsmitlied (alphabetisch nach Vorname und Nachname)
          erhält jedes zwölfte Mitglied die gleiche Farbe. Es kann daher vorkommen, dass
          unterschiedliche Ratsmitglieder mit der gleichen Farbe markiert werden.
        </li>
        <li>
          Beim Wechsel des angezeigten Grossen Rates (aktueller oder vergangener Grosser Rat), wird
          akutell ein allfällig gesetzter Fokus auf ein Ratsmitglied entfernt.
        </li>
      </ul>
    </div>
    <div class="about-column" style="flex: 1">
      <p>
        Der Code für die Website und die Visualisierungen ist auf GitHub verfügbar:<br />
        <a href="https://github.com/cyrill-martin/grosser-rat-basel-stadt" target="_blank"
          >https://github.com/cyrill-martin/grosser-rat-basel-stadt</a
        >.
      </p>
    </div>
    <div class="about-column" style="flex: 1">
      <p>
        Feedback und Änderungsvorschläge sind willkommen!<br />
        Neues wird hier getestet:
        <a href="https://grosserrat-bs-test.kmapper.ch/" target="_blank"
          >https://grosserrat-bs<b>-test</b>.kmapper.ch/</a
        >
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
  height: 72px;
}

@media only screen and (max-width: 1200px) {
  .about-column {
    margin: auto;
    width: 100%;
    font-size: 12px;
  }
  img {
    height: 54px;
  }
}
</style>
