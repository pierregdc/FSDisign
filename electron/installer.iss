; Script d'installation Inno Setup pour FSDisign (FranceStudent CANVA)
#define MyAppName "FSDisign"
#define MyAppFullName "FranceStudent CANVA - Studio UI Design"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "FranceStudent"
#define MyAppURL "https://ia.francestudent.org"
#define MyAppExeName "FSDisign.exe"

[Setup]
AppId={{8F2E9DE2-7227-4DC1-8C99-BC3DE926393D}
AppName={#MyAppFullName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppFullName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL=https://github.com/pierregdc/FSDisign
DefaultDirName={localappdata}\Programs\FSDisign
DisableProgramGroupPage=yes
DefaultGroupName={#MyAppPublisher}
OutputDir=..\dist\installer
OutputBaseFilename=FSDisign-Setup
Compression=lzma2/fast
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
DisableWelcomePage=no
ShowLanguageDialog=no

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\dist\FSDisign-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppFullName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppFullName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppFullName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppFullName}}"; Flags: nowait postinstall skipifsilent
