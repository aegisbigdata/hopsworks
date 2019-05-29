/*
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
 */

package io.hops.hopsworks.common.jupyter;

import io.hops.hopsworks.common.dao.project.Project;
import io.hops.hopsworks.common.exception.RESTCodes;
import io.hops.hopsworks.common.exception.ServiceException;
import io.hops.hopsworks.common.util.OSProcessExecutor;
import io.hops.hopsworks.common.util.ProcessDescriptor;
import io.hops.hopsworks.common.util.ProcessResult;
import io.hops.hopsworks.common.util.Settings;
import org.apache.commons.codec.digest.DigestUtils;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import java.io.IOException;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

@Stateless
@TransactionAttribute(TransactionAttributeType.NEVER)
public class JupyterController {

  private static final Logger LOGGER = Logger.getLogger(JupyterController.class.getName());

  @EJB
  private OSProcessExecutor osProcessExecutor;
  @EJB
  private Settings settings;

  @TransactionAttribute(TransactionAttributeType.NOT_SUPPORTED)
  public void convertIPythonNotebook(String hdfsUsername, String notebookPath, Project project, String pyPath)
      throws ServiceException {

    String conversionDir = DigestUtils.sha256Hex(Integer.toString(ThreadLocalRandom.current().nextInt()));
    notebookPath = notebookPath.replace(" ", "\\ ");
    pyPath = pyPath.replace(" " , "\\ ");

    String prog = settings.getHopsworksDomainDir() + "/bin/convert-ipython-notebook.sh";
    ProcessDescriptor processDescriptor = new ProcessDescriptor.Builder()
        .addCommand(prog)
        .addCommand(notebookPath)
        .addCommand(hdfsUsername)
        .addCommand(settings.getAnacondaProjectDir(project))
        .addCommand(pyPath)
        .addCommand(conversionDir)
        .setWaitTimeout(60l, TimeUnit.SECONDS) //on a TLS VM the timeout needs to be greater than 20s
        .build();

    LOGGER.log(Level.FINE, processDescriptor.toString());
    try {
      ProcessResult processResult = osProcessExecutor.execute(processDescriptor);
      if (!processResult.processExited() || processResult.getExitCode() != 0) {
        throw new ServiceException(RESTCodes.ServiceErrorCode.IPYTHON_CONVERT_ERROR,  Level.SEVERE,
            "error code: " + processResult.getExitCode(), "Failed to convert " + notebookPath
          + "\nstderr: " + processResult.getStderr()
          + "\nstdout: " + processResult.getStdout());
      }
    } catch (IOException ex) {
      throw new ServiceException(RESTCodes.ServiceErrorCode.IPYTHON_CONVERT_ERROR, Level.SEVERE, null, ex.getMessage(),
          ex);
    }
  }
}
