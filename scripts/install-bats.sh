if type test/bin/bats 2>/dev/null 1>/dev/null
then
  echo "Bats is already installed"
else
  rm -rf tmp
  git clone https://github.com/sstephenson/bats.git tmp
  ./tmp/install.sh test
fi
