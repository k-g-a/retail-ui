import React from 'react';

import { Loader } from '../../../components/Loader';
import { Link } from '../../../components/Link';
const oldVersions = require('./oldVersions.json');

interface LibraryVersion {
  version: string;
  path: string;
}
interface ResponseData {
  versions: LibraryVersion[];
}

const baseUrl = 'https://ui.gitlab-pages.kontur.host/docs/storybook/react-ui';
const createEndpoint = (path: string) => `${baseUrl}/${path}`;
const jsonEndpoint = createEndpoint('reactUIStorybookVersions.json');

const renderLibraryVersionItem = ({ path, version }: LibraryVersion) => {
  const versionNumber = version.split('.');
  let versionHeader;
  // проверка на длину нужна для того, чтобы отделить "нетипичные" версии -- например 5.х.х
  // все "нетипичные" версии будем помечать заголовком второго уровня
  if (versionNumber.length === 3 && versionNumber[2] !== '0') {
    // 'patch'
    versionHeader = <h4 style={{ paddingLeft: '40px' }}>{version}</h4>;
  } else if (versionNumber.length === 3 && versionNumber[1] !== '0') {
    // 'minor'
    versionHeader = <h3 style={{ paddingLeft: '20px' }}>{version}</h3>;
  } else {
    // 'major'
    versionHeader = <h2>{version}</h2>;
  }

  return (
    <Link target="_blank" href={path} style={{ display: 'block' }}>
      {versionHeader}
    </Link>
  );
};

const renderLibraryVersions = (libraryVersions: LibraryVersion[]) => {
  if (libraryVersions.length === 0) {
    return <p>Список версий пуст.</p>;
  }
  const allVersions: LibraryVersion[] = [...libraryVersions, ...oldVersions];
  return <>{allVersions.sort(sortVersions).map((libraryVersion) => renderLibraryVersionItem(libraryVersion))}</>;
};

const sortVersions = (a: LibraryVersion, b: LibraryVersion) => {
  const versionPattern = /^\d+\.\d+\.\d+$/;
  if (!versionPattern.test(a.version) && !versionPattern.test(b.version)) {
    return a.version.localeCompare(b.version);
  } else if (!versionPattern.test(a.version)) {
    return -1;
  } else if (!versionPattern.test(b.version)) {
    return 1;
  }
  const splitA = a.version.split(versionPattern).map((x) => Number(x));
  const splitB = b.version.split(versionPattern).map((x) => Number(x));
  if (splitA[0] > splitB[0]) {
    return 1;
  } else if (splitA[0] < splitB[0]) {
    return -1;
  } else if (splitA[1] > splitB[1]) {
    return 1;
  } else if (splitA[1] < splitB[1]) {
    return -1;
  } else if (splitA[2] > splitB[2]) {
    return 1;
  } else if (splitA[2] < splitB[2]) {
    return -1;
  } else {
    return 0;
  }
};

const renderErrorMessage = (errMessage?: string) => {
  return (
    <>
      <p style={{ margin: '0' }}>Не удалось загрузить список версий.</p>
      <p style={{ margin: '0' }}>{errMessage ? `Ошибка при запросе: ${errMessage}.` : 'Ошибка при запросе.'}</p>
    </>
  );
};

export const VersionsLibrary = () => {
  const [errMessage, setErrorMessage] = React.useState('');
  const [libraryVersions, setLibraryVersions] = React.useState<LibraryVersion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchAllVersionsLibrary = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(jsonEndpoint);
        if (!response.ok) {
          setErrorMessage(`${response.status}`);
          setLibraryVersions([]);
          return;
        }
        const { versions }: ResponseData = await response.json();
        setErrorMessage('');
        setLibraryVersions(versions.filter((x) => !isNaN(Number(x.version.split('.')[0]))));
      } catch (err) {
        setErrorMessage(err?.message);
        setLibraryVersions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAllVersionsLibrary();
  }, []);

  return (
    <Loader active={isLoading}>
      {errMessage && renderErrorMessage(errMessage)}
      {!errMessage && !isLoading && renderLibraryVersions(libraryVersions)}
    </Loader>
  );
};
