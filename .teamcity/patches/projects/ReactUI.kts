package patches.projects

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.Project
import jetbrains.buildServer.configs.kotlin.v2018_2.ui.*

/*
This patch script was generated by TeamCity on settings change in UI.
To apply the patch, change the project with id = 'ReactUI'
accordingly, and delete the patch script.
*/
changeProject(RelativeId("ReactUI")) {
    expectBuildTypesOrder(RelativeId("ReactUI_LintTest"), RelativeId("ReactUI_ScreenshotTests"), RelativeId("ReactUI_CreeveyTests"), RelativeId("ReactUI_BuildRetailUi"), RelativeId("ReactUI_Publish"))
    buildTypesOrderIds = arrayListOf(RelativeId("ReactUI_LintTest"), RelativeId("ReactUI_ScreenshotTests"), RelativeId("ReactUI_BuildRetailUi"), RelativeId("ReactUI_Publish"))
}
