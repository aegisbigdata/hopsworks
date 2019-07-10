/*
 * Changes to this file committed after and not including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * This file is part of Hopsworks
 * Copyright (C) 2018, Logical Clocks AB. All rights reserved
 *
 * Hopsworks is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * Hopsworks is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 *
 * Changes to this file committed before and including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * Copyright (C) 2013 - 2018, Logical Clocks AB and RISE SICS AB. All rights reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the 'Software'), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS  OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

angular.module('hopsWorksApp')
    .config(['$translateProvider', function ($translateProvider) {

        $translateProvider
            .translations('de_DE', {
                NAV: {
                    PROJECT: 'Projekt',
                    SETTINGS: 'Einstellungen',
                    DATASETS: 'Datensätze',
                    MEMBERS: 'Mitglieder',
                    ACTIVITY_STREAM: 'Aktivitäten',
                    TOOLS: 'Werkzeuge',
                    EXTENDED_METADATA: 'Erweiterte Metadaten',
                    MESSAGES: 'Nachrichten',
                    SEARCH_PLACEHOLDER: 'Nach Projekten und Datensätzen suchen...',
                    CLUSTER_USE: 'Cluster Auslastung'
                },
                FILTER: {
                    LABEL: 'Filter',
                    ALL: 'Alle',
                    SHARED: 'Mit mir geteilt',
                    PUBLIC: 'Öffentlich im Cluster',
                    MY_DATASETS: 'Meine Datensätze',
                    MY_REQUESTS: 'Meine Anfragen'
                },
                DATASET: {
                    GO_UP: 'Zurück',
                    NEW_FOLDER: 'Neuer Ordner',
                    UPLOAD: 'Upload',
                    FILE_ACTIONS: 'Datei-Aktionen',
                    COPY: 'Kopieren',
                    MOVE: 'Verschieben',
                    RENAME: 'Umbenennen',
                    DELETE: 'Löschen',
                    DOWNLOAD: 'Download',
                    PREVIEW: 'Vorschau',
                    TYPE: 'Typ',
                    NAME: 'Name',
                    OWNER: 'Besitzer',
                    LAST_MODIFIED: 'Letzte Änderung',
                    SIZE: 'Dateigröße'
                },
                HOME: {
                    STARTED: 'Hier geht\'s los',
                    STARTED_INTRO: 'Sind Sie neu auf der AEGIS Plattform? Unser Tutorial gibt Ihnen einen Einblick in die Tools.',
                    MARKETPLACE: 'AEGIS Marktplatz',
                    MARKETPLACE_INTRO: 'Lernen Sie die Möglichkeiten von AEGIS kennen! Finden Sie populäre Datensätze für Ihr Projekt.',
                    NEW: 'Neuigkeiten',
                    NEW_INTRO: 'Erfahren Sie alle Neuigkeiten rund um die AEGIS Plattform.',
                    LEARN: 'Mehr erfahren',
                    GO_MARKET: 'Zum Marktplatz',
                    READ_MORE: 'Weiter',
                    MY_PROJECTS: 'Meine Projekte',
                    NEW_PROJECT: 'Neues Projekt'
                }
            })
            .translations('en_EN', {
                NAV: {
                    PROJECT: 'Project',
                    SETTINGS: 'Setings',
                    DATASETS: 'Datasets',
                    MEMBERS: 'Members',
                    ACTIVITY_STREAM: 'Activity-Stream',
                    TOOLS: 'Tools',
                    EXTENDED_METADATA: 'Extended Metadata',
                    MESSAGES: 'Messages',
                    SEARCH_PLACEHOLDER: 'Search for projects or datasets...',
                    CLUSTER_USE: 'Cluster Utilization'
                },
                FILTER: {
                    LABEL: 'Filter',
                    ALL: 'All',
                    SHARED: 'Shared with Me',
                    PUBLIC: 'Public in Cluster',
                    MY_DATASETS: 'My Datasets',
                    MY_REQUESTS: 'My Requests'
                },
                DATASET: {
                    GO_UP: 'Go up',
                    NEW_FOLDER: 'New Folder',
                    UPLOAD: 'Upload',
                    FILE_ACTIONS: 'File Actions',
                    COPY: 'Copy',
                    MOVE: 'Move',
                    RENAME: 'Rename',
                    DELETE: 'Delete',
                    DOWNLOAD: 'Download File',
                    PREVIEW: 'Preview',
                    TYPE: 'Type',
                    NAME: 'Name',
                    OWNER: 'Owner',
                    LAST_MODIFIED: 'Last modified',
                    SIZE: 'File size'
                },
                HOME: {
                    STARTED: 'Getting Started',
                    STARTED_INTRO: 'If you are new to AEGIS click here! Learn how to use the AEGIS tools through a quick tutorial',
                    MARKETPLACE: 'AEGIS Marketplace',
                    MARKETPLACE_INTRO: 'See what\'s possible with AEGIS! Browse popular AEGIS datasets to use for your project',
                    NEW: 'What\'s New',
                    NEW_INTRO: 'Find out the latest news related to the AEGIS platform',
                    LEARN: 'Learn more',
                    GO_MARKET: 'Go to Marketplace',
                    READ_MORE: 'Read more',
                    MY_PROJECTS: 'My Projects',
                    NEW_PROJECT: 'New Project'
                }
            })
            .translations('it_IT', {
                NAV: {
                    PROJECT: 'Project',
                    SETTINGS: 'Setings',
                    DATASETS: 'Datasets',
                    MEMBERS: 'Members',
                    ACTIVITY_STREAM: 'Activity-Stream',
                    TOOLS: 'Tools',
                    EXTENDED_METADATA: 'Extended Metadata',
                    MESSAGES: 'Messages',
                    SEARCH_PLACEHOLDER: 'Search for projects or datasets...',
                    CLUSTER_USE: 'Cluster Utilization'
                },
                FILTER: {
                    LABEL: 'Filter',
                    ALL: 'All',
                    SHARED: 'Shared with Me',
                    PUBLIC: 'Public in Cluster',
                    MY_DATASETS: 'My Datasets',
                    MY_REQUESTS: 'My Requests'
                },
                DATASET: {
                    GO_UP: 'Go up',
                    NEW_FOLDER: 'New Folder',
                    UPLOAD: 'Upload',
                    FILE_ACTIONS: 'File Actions',
                    COPY: 'Copy',
                    MOVE: 'Move',
                    RENAME: 'Rename',
                    DELETE: 'Delete',
                    DOWNLOAD: 'Download File',
                    PREVIEW: 'Preview',
                    TYPE: 'Type',
                    NAME: 'Name',
                    OWNER: 'Owner',
                    LAST_MODIFIED: 'Last modified',
                    SIZE: 'File size'
                },
                HOME: {
                    STARTED: 'Getting Started',
                    STARTED_INTRO: 'If you are new to AEGIS click here! Learn how to use the AEGIS tools through a quick tutorial',
                    MARKETPLACE: 'AEGIS Marketplace',
                    MARKETPLACE_INTRO: 'See what\'s possible with AEGIS! Browse popular AEGIS datasets to use for your project',
                    NEW: 'What\'s New',
                    NEW_INTRO: 'Find out the latest news related to the AEGIS platform',
                    LEARN: 'Learn more',
                    GO_MARKET: 'Go to Marketplace',
                    READ_MORE: 'Read more',
                    MY_PROJECTS: 'My Projects',
                    NEW_PROJECT: 'New Project'
                }
            })
            .translations('el_GR', {
                NAV: {
                    PROJECT: 'Project',
                    SETTINGS: 'Setings',
                    DATASETS: 'Datasets',
                    MEMBERS: 'Members',
                    ACTIVITY_STREAM: 'Activity-Stream',
                    TOOLS: 'Tools',
                    EXTENDED_METADATA: 'Extended Metadata',
                    MESSAGES: 'Messages',
                    SEARCH_PLACEHOLDER: 'Search for projects or datasets...',
                    CLUSTER_USE: 'Cluster Utilization'
                },
                FILTER: {
                    LABEL: 'Filter',
                    ALL: 'All',
                    SHARED: 'Shared with Me',
                    PUBLIC: 'Public in Cluster',
                    MY_DATASETS: 'My Datasets',
                    MY_REQUESTS: 'My Requests'
                },
                DATASET: {
                    GO_UP: 'Go up',
                    NEW_FOLDER: 'New Folder',
                    UPLOAD: 'Upload',
                    FILE_ACTIONS: 'File Actions',
                    COPY: 'Copy',
                    MOVE: 'Move',
                    RENAME: 'Rename',
                    DELETE: 'Delete',
                    DOWNLOAD: 'Download File',
                    PREVIEW: 'Preview',
                    TYPE: 'Type',
                    NAME: 'Name',
                    OWNER: 'Owner',
                    LAST_MODIFIED: 'Last modified',
                    SIZE: 'File size'
                },
                HOME: {
                    STARTED: 'Getting Started',
                    STARTED_INTRO: 'If you are new to AEGIS click here! Learn how to use the AEGIS tools through a quick tutorial',
                    MARKETPLACE: 'AEGIS Marketplace',
                    MARKETPLACE_INTRO: 'See what\'s possible with AEGIS! Browse popular AEGIS datasets to use for your project',
                    NEW: 'What\'s New',
                    NEW_INTRO: 'Find out the latest news related to the AEGIS platform',
                    LEARN: 'Learn more',
                    GO_MARKET: 'Go to Marketplace',
                    READ_MORE: 'Read more',
                    MY_PROJECTS: 'My Projects',
                    NEW_PROJECT: 'New Project'
                }
            })
            .fallbackLanguage('en_EN');

        $translateProvider.preferredLanguage('en_EN');

    }]);
