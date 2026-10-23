import { Eyebrow, Panel, Skeleton } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Loading } from "@/shared/components/Loading";

import { styles as explorer } from "./components/NetworkExplorer/styles/index.styles";
import { skeletonStyles, styles } from "./styles/index.styles";

/** The Rede Relacional while the network loads: the presentation already, the controls and the graph in skeleton. */
export function NetworkSkeleton() {
  const t = useTranslations("NETWORK");

  return (
    <main className={styles.page}>
      <Loading className={explorer.root}>
        <div className={explorer.side}>
          <header className={`${styles.header} ${explorer.intro}`}>
            <Eyebrow>{t("EYEBROW")}</Eyebrow>
            <h1 className={styles.title}>{t("TITLE")}</h1>
            <p className={styles.intro}>{t("INTRO")}</p>
          </header>
          <Panel className={explorer.panel}>
            <Skeleton height={52} />
            <Skeleton height={36} />
            <Skeleton shape="text" lines={5} />
          </Panel>
        </div>
        <Skeleton height="100%" className={skeletonStyles.graph} />
      </Loading>
    </main>
  );
}
