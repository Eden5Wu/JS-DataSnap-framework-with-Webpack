program dsAndWebpack;
{$APPTYPE GUI}

{$R *.dres}

uses
  Forms,
  WebReq,
  IdHTTPWebBrokerBridge,
  ServerFormUnit in 'ServerFormUnit.pas' {Form1},
  DSMethodsUnit in 'DSMethodsUnit.pas' {ServerMethods1: TDataModule},
  ServerContainerUnit in 'ServerContainerUnit.pas' {WebModule2: TWebModule};

{$R *.res}

begin
  if WebRequestHandler <> nil then
    WebRequestHandler.WebModuleClass := WebModuleClass;
  Application.Initialize;
  Application.CreateForm(TForm1, Form1);
  Application.Run;
end.
