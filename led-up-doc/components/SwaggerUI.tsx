'use client';
import React, { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import * as yaml from 'js-yaml';
import { useThemeConfig } from 'nextra-theme-docs';

const SwaggerComponent: React.FC<{ yamlFileUrl: string }> = ({ yamlFileUrl }) => {
  const [spec, setSpec] = useState<object | null>(null);

  useEffect(() => {
    const fetchYaml = async () => {
      try {
        const response = await fetch(yamlFileUrl);
        if (!response.ok) throw new Error('Network response was not ok');

        const yamlText = await response.text();
        const parsedSpec = yaml.load(yamlText); // Use js-yaml to parse the YAML
        setSpec(parsedSpec as object);
      } catch (error) {
        console.error('Error fetching or parsing YAML file:', error);
      }
    };

    fetchYaml();
  }, [yamlFileUrl]);

  const { darkMode } = useThemeConfig();
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!spec) return <div>Loading...</div>;

  // @ts-expect-error - SwaggerUI type is incompatible with React 18
  return <SwaggerUI spec={spec} />;
};

export default SwaggerComponent;
