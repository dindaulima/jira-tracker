Tracking JIRA

![img](<Plan Tracker Jira.jpeg>)

1. Get all issues jira tim produk yang diupdate 1 hari sebelumnya [DONE]
2. Untuk setiap issue, get detail issuenya [DONE]
3. Extract tabel Test Case dari detail issue [DONE]
4. Extract tabel QA Feedback [DONE]
5. Mining data
    complete documentation ---->  precondition, test data, steps, dan expected result. [ON PROGRESS] --> use AI for a better result
    coverage of test scenario ----> priority = must have dan status = passed [DONE]
    Bug found during development process ---> Jumlah issue yang dicatat di QA Feedback [DONE]
6. Hitung persentase dari complete dokumentasi dan coverage testing [DONE]
7. Hitung bug development [DONE]
8. Insert/Update Test Case into TCM
9. Update nilai complete dokumentasi, coverage testing, dan bug development di jira
10. Script dieksekusi setiap dini hari

Penulisan JIRA
1. Acceptance Criteria ---> acceptance criteria dan test scenario 
2. Test Case ---> full dokumentasi testing
3. QA Feedback ---> Catat Bug dan temuan
4. Cek Fisik ---> checklist pengujian
5. complete dokumentasi, coverage testing, dan bug development ---> diupdate otomatis dari hasil text mining