# Testa upload de foto no Vercel (com WebSession pra manter cookies)
$base = "https://alm-distribuidora.vercel.app"

Write-Host "=== 1. Login (cria WebSession) ===" -ForegroundColor Cyan
$body = '{"email":"aurelio@alm.com","senha":"vendedor123"}'
$login = Invoke-WebRequest -Uri "$base/api/login" -UseBasicParsing -TimeoutSec 30 -Method Post -ContentType "application/json" -Body $body -SessionVariable sv
Write-Host "OK - Status $($login.StatusCode)"

Write-Host "`n=== 2. Verificando sessao ===" -ForegroundColor Cyan
$me = Invoke-WebRequest -Uri "$base/api/login" -UseBasicParsing -TimeoutSec 30 -Method Get -WebSession $sv
Write-Host "Sessao: $($me.Content)"

Write-Host "`n=== 3. Criando imagem de teste ===" -ForegroundColor Cyan
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(100, 100)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Red)
$g.Dispose()
$path = "$env:TEMP\test-upload-alm.png"
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$size = (Get-Item $path).Length
Write-Host "OK - $path ($size bytes)"

Write-Host "`n=== 4. Enviando upload via Vercel Blob ===" -ForegroundColor Cyan
$fileBin = [System.IO.File]::ReadAllBytes($path)
$boundary = "----Boundary" + [Guid]::NewGuid().ToString("N")
$lf = "`r`n"
$body2 = "--$boundary$lf" +
  "Content-Disposition: form-data; name=`"file`"; filename=`"test.png`"$lf" +
  "Content-Type: image/png$lf$lf"
$bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body2)
$endBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes("$lf--$boundary--$lf")
$fullBody = $bodyBytes + $fileBin + $endBytes
try {
  $r = Invoke-WebRequest -Uri "$base/api/upload" -UseBasicParsing -TimeoutSec 60 -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $fullBody -WebSession $sv
  Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
  Write-Host "Body: $($r.Content)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  Write-Host "ERRO $code" -ForegroundColor Red
  Write-Host $reader.ReadToEnd()
}

Remove-Item $path -ErrorAction SilentlyContinue
