import { FileIcon, FolderIcon } from 'lucide-react';
import { TypeScriptIcon } from 'nextra/icons';

const FileTree = () => {
  return (
    <ul className="hidden md:block text-darker dark:text-light menu menu-md shadow border-r border-gray-300 dark:border-gray-600 rounded-bl rounded-tl max-w-xs z-0 w-[250px] h-[768px] pt-6 bg-gray-200 dark:bg-darker">
      <li>
        <details open>
          <summary>
            <FolderIcon />
            client
          </summary>

          <ul>
            <li>
              <a>
                <FileIcon />
                index.html
              </a>
            </li>
          </ul>
        </details>
      </li>
      <li>
        <details open>
          <summary>
            <FolderIcon />
            server
          </summary>
          <ul>
            <li>
              <a>
                <TypeScriptIcon />
                express.ts
              </a>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  );
};

export default FileTree;
