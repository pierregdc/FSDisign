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
SetupIconFile=app-icon.ico
WizardImageFile=wizard-large.bmp
WizardSmallImageFile=wizard-small.bmp
WizardStyle=modern
WizardResizable=no
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=lowest
DisableWelcomePage=no
ShowLanguageDialog=no

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
french.WelcomeLabel1=Bienvenue dans le Studio FSDisign
french.WelcomeLabel2=Cet assistant va installer FranceStudent CANVA (Studio UI & IA) sur votre ordinateur.%n%nFonctionnalites integrees :%n- Cartes mentales & schemas conceptuels fluides%n- Module mathematiques (geometrie, traceur f(x), tableur)%n- Simulateur de voyage multimodal (train, vol, voiture, marche)%n- Tuteur & IA connectee France Student (ia.francestudent.org)%n%nCliquez sur Suivant pour continuer.
french.FinishedHeadingLabel=FSDisign est pret !
french.FinishedLabel=L'installation de FranceStudent CANVA est terminee avec succes.%n%nAu premier lancement, un tutoriel interactif vous guidera pour connecter votre compte et decouvrir l'ensemble des modules.

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\dist\FSDisign-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppFullName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppFullName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppFullName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppFullName}}"; Flags: nowait postinstall skipifsilent
