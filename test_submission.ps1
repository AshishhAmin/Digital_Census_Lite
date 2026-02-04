$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    name = "CLI Tester"
    age = 35
    gender = "Female"
    occupation = "Script Runner"
    household_size = 3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/submit/" -Method Post -Headers $headers -Body $body
    Write-Host "Submission Successful!" -ForegroundColor Green
    Write-Host "Response Payload:"
    $response | Format-List
} catch {
    Write-Host "Submission Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}
