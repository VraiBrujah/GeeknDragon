import re

with open('SONDAGE_ORIA_MVP_4_MODULES.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def check_sequence(prefix):
    nums = []
    for line in lines:
        m = re.match(r'^\| (' + prefix + r'-(\d+))', line)
        if m:
            nums.append(int(m.group(2)))
    nums.sort()
    print(f'\n{prefix} - Total: {len(nums)}')
    if nums:
        print(f'  Premier: {prefix}-{nums[0]:03d}')
        print(f'  Dernier: {prefix}-{nums[-1]:03d}')
        trous = []
        for i in range(len(nums)-1):
            if nums[i+1] != nums[i] + 1:
                trous.append(f'{prefix}-{nums[i]:03d} -> {prefix}-{nums[i+1]:03d}')
        if trous:
            print('  TROUS:')
            for t in trous:
                print(f'    {t}')
        else:
            print('  Aucun trou')

check_sequence('COM')
check_sequence('HOR')
check_sequence('GES')
check_sequence('ADM')
check_sequence('BET')
check_sequence('PAY')
