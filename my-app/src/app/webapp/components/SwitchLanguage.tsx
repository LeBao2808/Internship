import { i18n } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
export default function SwitchLanguage() {
    const { t, i18n } = useTranslation();
    const { locale, asPath } = useRouter()

    return (
        <Link href={asPath} locale={i18n.language === "vi" ? "en" : "vi"} onClick={() => i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")}>
        {i18n.language === "vi" ? "English" : "Tiếng Việt"}
      </Link>

    )
}

